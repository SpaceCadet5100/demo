var loadTextResource = function (url, cb) {   
    var request = new XMLHttpRequest();
    request.open('GET', url);
    request.onload = function () {
        if (request.status < 200 || request.status > 299)
        {
            cb('Error loading resource')

        }
        else {
            cb(null, request.responseText);
        }
    }
    request.send();
};

var loadJSONResource = function (url, cb)
{
    loadTextResource(url, function (err, result) {
        if(err)
        {
            cb(err);
        }
        else {
            try {
                cb(null, JSON.parse(result));
            }
            catch (e) {
                cb(e);
            }
        }
    }
    );
}

export default loadJSONResource;