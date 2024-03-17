import React, {useEffect, useState} from "react";
import {connect} from 'react-redux';
import {getTabs, getTiles, getTileData, getTileGaugeData, getTileGraphData} from "../../services/api";
import Tabs from "../../components/Dashboard/Tabs";
import Pane from "../../components/Dashboard/Pane";
import {reject} from "lodash";
import {
    GET_TILES, SET_TILES_DATA, SET_TILE_DATA, ADD_TILE, SET_GRAPH_DATA, RESET_GRAPH_DATA, UPDATE_GRAPH_DATA
} from '../../redux/constrants/actionTypes';
import {isMobile} from "react-device-detect";

let ws;
let timerTiles;
let refreshTime = 1000 * 60 * 2;
const Dashboard = ({setTilesData, setTileData, addTile, resetGraph, addGraph, updateGraph}) => {

    const [tabs, setTabs] = useState([]);
    const [selectedTab, setSelectedTab] = useState({});
    const [tiles, setTiles] = useState([]);
    const [isDraggable, setIsDraggable] = useState(false);
    const [layouts, setLayouts] = useState({});
    const [prevLayouts, setPrevLayouts] = useState({});
    const [location, setLocation] = useState(null);

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

    useEffect(() => {

        loadTabs()

        ws = new WebSocket(`ws://127.0.0.1/ws/monitoring/${localStorage.getItem('token')}/`);
        ws.onopen = () => {
            ws.addEventListener('message', function (event) {
                const data = JSON.parse(event.data)
                if (data?.id) {
                    setTileData(data);
                    // switch (data?.tile) {
                    // case 'get_tiles':
                    //     setTilesData(data.response)
                    //     break;
                    // case 'get_data':
                    //     setTileData(data.response)
                    //     break;
                    // case 'get_tile':
                    //     addTile(data.response)
                    //     break;
                    // default:
                    //     break;
                    // }
                }
            });
        };

        return () => {
            ws.close()
            clearTimeout(timerTiles);
        }
    }, []);

    useEffect(() => {
        if (selectedTab?.id) {
            resetGraph()
            setLocation(selectedTab?.location ? selectedTab?.location : null)
            loadTiles();
            setTimeout(() => {
                if (ws.readyState === 1) {
                    ws.send(JSON.stringify({
                        "tab_id": selectedTab?.id
                    }));
                }
            },2000)
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

