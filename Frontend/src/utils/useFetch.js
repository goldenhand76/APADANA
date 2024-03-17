import {useState, useEffect, useCallback} from "react";

function useFetch(page, request, actorContentTypeId = null, actorObjectId = null, timestamp = null) {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [list, setList] = useState([]);
    const [next, setNext] = useState(null)

    const sendQuery = useCallback(() => {
        try {
            setLoading(true);
            setError(false);
            request(page, actorContentTypeId, actorObjectId, timestamp).then(res => {
                setNext(!!res?.next)
                setList(prev => [...prev, ...res.results]);
                setLoading(false);
            }).catch(err => setError(err));
        } catch (err) {
            setError(err);
        }
    }, [page]);

    useEffect(() => {
        sendQuery();
    }, [sendQuery, page]);

    return {loading, error, list, next};
}

export default useFetch;