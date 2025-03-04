import React, {useEffect, useState, useRef} from "react";
import {connect} from 'react-redux';
import {getTabs, getTiles, getTileData, getTileGaugeData, getTileGraphData} from "../../services/api";
import Tabs from "../../components/Dashboard/Tabs";
import Pane from "../../components/Dashboard/Pane";
import {reject} from "lodash";
import {
    GET_TILES, SET_TILES_DATA, SET_TILE_DATA, ADD_TILE, SET_GRAPH_DATA, RESET_GRAPH_DATA, UPDATE_GRAPH_DATA
} from '../../redux/constrants/actionTypes';
import {isMobile} from "react-device-detect";


let timerTiles;
const refreshTime = 1000 * 60 * 2; // 2 minutes

const Dashboard = ({setTilesData, setTileData, addTile, resetGraph, addGraph, updateGraph}) => {

    const [tabs, setTabs] = useState([]);
    const [selectedTab, setSelectedTab] = useState({});
    const [tiles, setTiles] = useState([]);
    const [isDraggable, setIsDraggable] = useState(false);
    const [layouts, setLayouts] = useState({});
    const [prevLayouts, setPrevLayouts] = useState({});
    const [location, setLocation] = useState(null);

    const ws = useRef(null); // Use a ref to persist the WebSocket instance
    const reconnectAttempts = useRef(0); // Track reconnection attempts
    const maxReconnectAttempts = 5; // Maximum number of reconnection attempts
    const reconnectDelay = useRef(1000); // Initial reconnect delay (1 second)

    useEffect(() => {
        timerTiles = setInterval(() => {
            tiles?.map(item => {
                if (item.size === "large") {
                    getTileGraphData(item?.id)
                        .then(res => {
                            updateGraph(res);
                        }).catch(err => console.log(err))
                }
            })
        }, refreshTime)
    }, [tiles])


    // Function to establish WebSocket connection
    const connectWebSocket = () => {
        ws.current = new WebSocket(`ws://127.0.0.1/ws/monitoring/${localStorage.getItem('token')}/`);
        ws.current.onopen = () => {
            console.log("WebSocket connected");
            reconnectAttempts.current = 0; // Reset reconnection attempts on successful connection
            reconnectDelay.current = 1000; // Reset reconnect delay

            // Send the selected tab ID to the WebSocket
            if (selectedTab?.id) {
                ws.current.send(JSON.stringify({ tab_id: selectedTab.id }));
            }
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data?.id) {
                setTileData(data); // Update tile data in Redux
            }
        };

        ws.current.onerror = (error) => {
            console.error("WebSocket error:", error);
            ws.current.close(); // Close the WebSocket on error
        };

        ws.current.onclose = () => {
            console.log("WebSocket disconnected");
            if (reconnectAttempts.current < maxReconnectAttempts) {
                // Attempt to reconnect with exponential backoff
                setTimeout(() => {
                    reconnectAttempts.current += 1;
                    reconnectDelay.current *= 2; // Double the delay
                    console.log(`Reconnecting... Attempt ${reconnectAttempts.current}`);
                    connectWebSocket();
                }, reconnectDelay.current);
            } else {
                console.error("Max reconnection attempts reached. Please refresh the page.");
            }
        };
    };

    // Initialize WebSocket connection on component mount
    useEffect(() => {
        loadTabs()
        connectWebSocket();

        // Cleanup WebSocket and timer on component unmount
        return () => {
            if (ws.current) {
                ws.current.close();
            }
            clearInterval(timerTiles);
        };
    }, []);

    
    // Load tiles when selectedTab changes
    useEffect(() => {
        if (selectedTab?.id) {
            loadTiles();
        }
    }, [selectedTab]);


    // Send selected tab ID to WebSocket when tab changes
    useEffect(() => {
        if (selectedTab?.id && ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ tab_id: selectedTab.id }));
        }
    }, [selectedTab]);


    useEffect(() => {
        resetGraph()
        tiles.map(item => {
            getTileGaugeData(item.id)
                .then(res => {
                    setTileData(res)
                }).catch(err => console.log(err))
            if (item.size === "large") {
                getTileGraphData(item?.id)
                    .then(res => {
                        addGraph(res);
                    }).catch(err => console.log(err))
            }
        })
    }, [tiles])


    const getGraphData = (id) => {
        getTileGraphData(id)
            .then(res => {
                addGraph(res);
            }).catch(err => console.log(err))
    }

    const loadTabs = async () => {
        let response = await getTabs();
        if (response) {
            setTabs(response);
            setSelectedTab(response[0]);
        }
    }

    const loadTiles = async () => {
        let response = await getTiles(selectedTab?.id);
        if (response) {
            setTiles(response);
            setTilesData(response)
        }
    }

    const onLayoutChange = (layout, layouts) => {
        setLayouts(layouts);
        localStorage.setItem(`position-${selectedTab.id}`, JSON.stringify(layouts))
    }

    const onRemoveItem = (i) => {
        setTiles(reject(tiles, {id: i}));
    }

    const editLayout = () => {
        setPrevLayouts(layouts);
        setIsDraggable(true);
    }

    const resetLayout = () => {
        localStorage.setItem(`position-${selectedTab.id}`, JSON.stringify(prevLayouts))
        setLayouts(prevLayouts);
        setIsDraggable(false);
    }

    useEffect(() => {
        if (isDraggable) {
            if (Object.keys(prevLayouts).length !== 0) {
                resetLayout()
            }
        }
    }, [selectedTab])

    return (
        <div className="">
            <Tabs tabs={tabs} onLoadTabs={loadTabs} onEditLayout={editLayout} isDraggable={isDraggable}
                  onClick={setSelectedTab} selectedTab={selectedTab}/>
            <div className={`row mt-3 overflow-auto height-custom ${isMobile ? "pb-5" : ""}`}>
                <div className="col-xl-12 col-sm-12">
                    <Pane
                        tiles={tiles}
                        selectedTab={selectedTab}
                        useCSSTransforms={true}
                        onRemoveItem={onRemoveItem}
                        onLayoutChange={onLayoutChange}
                        onloadTiles={loadTiles}
                        onResetLayout={resetLayout}
                        isDraggable={isDraggable}
                        setIsDraggable={setIsDraggable}
                        layouts={layouts}
                        setLayouts={setLayouts}
                        location={location}
                        setLocation={setLocation}
                    />
                </div>
            </div>
        </div>
    );
}

const mapDispatchToProps = dispatch => ({
    setTilesData: (data) => dispatch({type: SET_TILES_DATA, payload: data}),
    setTileData: (data) => dispatch({type: SET_TILE_DATA, payload: data}),
    addTile: (data) => dispatch({type: ADD_TILE, payload: data}),
    addGraph: (data) => dispatch({type: SET_GRAPH_DATA, payload: data}),
    updateGraph: (data) => dispatch({type: UPDATE_GRAPH_DATA, payload: data}),
    resetGraph: () => dispatch({type: RESET_GRAPH_DATA})
});

export default connect(null, mapDispatchToProps)(Dashboard);

