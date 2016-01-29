var request = require('request-promise');

var VOODOO_KEY = "";
var HOST = "https://staging-api.voodoomfg.com/api/1";

function authRequest(options) {
    options.headers = {
        "Content-Type": "application/json",
        "key": VOODOO_KEY
    };

    return options;
}

function createModel(modelUrl) {
    var options = {
        method: "POST",
        url: HOST + "/model",
        body: {
            file_url: modelUrl
        },
        json: true
    };

    return request(authRequest(options));
}

function getMaterials() {
    var options = {
        method: "GET",
        url: HOST + "/materials",
        json: true
    };

    return request(authRequest(options));
}

function getItemQuote(model) {
    var options = {
        method: "GET",
        url: HOST + "/model/quote",
        body: model,
        json: true
    };

    return request(authRequest(options));
}

function getShippingOptions(models, shipping_address) {
    var options = {
        method: "POST",
        url: HOST + "/order/shipping",
        body: {
            models: models,
            shipping_address: shipping_address
        },
        json: true
    };

    return request(authRequest(options));
}

function createOrder(models, shipment_id) {
    var options = {
        method: "POST",
        url: HOST + "/order/create",
        body: {
            models: models,
            shipment_id: shipment_id
        },
        json: true
    };

    return request(authRequest(options));
}

function confirmOrder(quote_id) {
    var options = {
        method: "POST",
        url: HOST + "/order/confirm",
        body: {
            quote_id: quote_id
        },
        json: true
    };

    return request(authRequest(options));
}

module.exports = {
    createModel: createModel,
    getMaterials: getMaterials,
    getItemQuote: getItemQuote,
    getShippingOptions: getShippingOptions,
    createOrder: createOrder,
    confirmOrder: confirmOrder
};
