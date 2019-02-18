async function approve(authToken, tokenAddress, spenderAddress, amount) {
    return rp({
        method: "POST",
        uri: rtrim(baseUrl, "/") +
            `/dtxtoken/${tokenAddress}/approve`,
        body: {
            _spender: spenderAddress,
            _value: amount
        },
        headers: {
            Authorization: authToken
        },
        json: true
    });
}
