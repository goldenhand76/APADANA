import React, {useEffect, useState} from 'react';
import AddTile from "../../components/Dashboard/AddTile";
import {addTile, getTile, updateTile} from "../../services/api";
import {useHistory, useLocation, useParams} from "react-router-dom";
import {convertToNumber} from "../../utils/convertToNumber";

const AddNewTile = () => {

    const [isLoading, setIsLoading] = useState(false)
    const [tile, setTile] = useState(null);
    const [errors, setErrors] = useState(null);
    const location = useLocation()
    const history = useHistory();
    const { selectedTab } = location.state
    const {id} = useParams();

    useEffect(() => {
        if (id) {
            getTile(id)
                .then((res) => {
                    setTile({...res, id});
                })
                .catch((err) => {
                    console.log(err, "err");
                });
        }
    }, []);

    const updateLocalStoragePosition = (data) => {
        const positions = JSON.parse(localStorage.getItem(`position-${selectedTab.id}`));
        convertToNumber(data.status);
        Object.values(positions).map(item => {
            if (item.length > 0) {
                const index = item.findIndex(i => i.i === tile.id.toString())
                item[index] = {...item[index], ...data.status};
            }
        })
        localStorage.setItem(`position-${selectedTab.id}`, JSON.stringify(positions))
    }

    const addTileToTab = async (data) => {
        setErrors(null)
        setIsLoading(true);
        let response = null;
        try {
            if (tile) {
                response = await updateTile(data, tile?.id)
                updateLocalStoragePosition()
            } else {
                response = await addTile(data, selectedTab);
            }
            setIsLoading(false)
        } catch (error) {
            if (error?.response?.status === 403) {
                history.goBack()
                alert.show(error?.response?.data?.error?.details?.detail, {type: "error"});
            } else {
                setIsLoading(false)
                setErrors(error?.response?.data?.error?.details)
            }
        }
        if (response) {
            alert.show(tile ? "با موفقیت ویرایش گردید." : "با موفقیت اضافه گردید.", {type: "success"});
            history.goBack()
        }
    }

    return (
        <AddTile onSave={(data) => {
            addTileToTab(data)
        }}
                 isLoading={isLoading}
                 tile={tile}
                 errors={errors}
        />
    )
}

export default AddNewTile;