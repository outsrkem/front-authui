import request from "@/utils/request.js";

/**
 * AJAX request function module encapsulation
 * Expose an ajax function externally
 * Contains the following 4 parameters
 * @param {*} url Request path, default is empty
 * @param {*} method Request method, default is GET
 * @param {*} params Request parameters, default is empty
 * @param {*} data Request body data, default is empty
 */
export default function ajax(url = "", method = "GET", params, data) {
    /** Return a Promise object. The asynchronous returned data is response.data instead of the full response */
    return new Promise(function (resolve, reject) {
        /**
         * Send AJAX requests via axios
         * This promise stores the return value (Promise object) of axios
         * resolve(): Success callback
         * reject(): Failure callback
         */
        const promise = request({
            method,
            url,
            params,
            data,
        });
        promise
            .then((response) => {
                /** Success callback: invoke resolve() */
                resolve(response.data);
            })
            .catch((error) => {
                /** Failure callback: invoke reject() */
                reject(error);
            });
    });
}
