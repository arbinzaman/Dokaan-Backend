const fs = require('fs');
const pg = require('pg');
const url = require('url');

const config = {
    user: "avnadmin",
    password: "************************",
    host: "dokaan-redoxop45-7f94.k.aivencloud.com",
    port: 22545,
    database: "defaultdb",
    ssl: {
        rejectUnauthorized: true,
        ca: `-----BEGIN CERTIFICATE-----
MIIEQTCCAqmgAwIBAgIULGHkcpASdkv3fcpFpOArxQOo00cwDQYJKoZIhvcNAQEM
BQAwOjE4MDYGA1UEAwwvZWYyNGJmNDUtZDA0ZC00ZWUzLWJkODctNGI3YzlmYTIz
YzE0IFByb2plY3QgQ0EwHhcNMjUwMTEzMTgzNTQ2WhcNMzUwMTExMTgzNTQ2WjA6
MTgwNgYDVQQDDC9lZjI0YmY0NS1kMDRkLTRlZTMtYmQ4Ny00YjdjOWZhMjNjMTQg
UHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBAIaoij4u
ycsM+Z0+dbljEaFdk6pmUqgOOWD+v2sEYIl7qMzpC0aXBsEswm36Kf1g2Qh9U+CX
Za2PVO09Fwwe31iceQEMigQVJHYydPrkHEUNO9NEBGKs08JCWSLMj6kLKUir6XB9
L10QzWLXwPVg8Qw6hzE9IhrUKMJZmvb0wIEavLPwqAOy7GngvT6q28jbByc+PCx4
O+/fr7o1hR57xwKkfcX5B6R030Z5TPMn1YZ8mSbG8eRtbCzvrIb9J9s3QtYcRUeU
Ax1YpnGhpcvv6x+d/6kl5Gunnfbs4GIX3/P1VVAAvb2Y2h/TPZLYeoC/1yJ06+4A
KZ6AbNP9tWnJl6f7/qJGQdD7nSEIhzHGzgWYLSK2NEbDhgyoW0gc8d1+5szi9B9h
tBEaal+xbZ21yeJn/TMvkYA4G6eSbsUkYJUj4Z8mnLQzWR19Sn+ZotVaUC3wIatE
GAf+gsCLDYlqHz/ENb3az4s0h67lkrgxD0UVDDtpNihLQU/qC2B07N2jswIDAQAB
oz8wPTAdBgNVHQ4EFgQUGb9GzfWET6jzdSvrpvsjrWIbzRowDwYDVR0TBAgwBgEB
/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGBAESJs0MhgBiHuE3Q
/qFgk8C8GaljmfVEejAQxzkeX0svgKk/t4187QKqYDF23Fj0TJHwcBQy1532Clbp
nuH+vVCg2qtJI6yt+oP8Zbd/IoM9MdjYHh5OMMccllot65+5Ifk4/yiUCnlC2A+H
8iSiMZMRqP3IeSgXIwZr9+5UEashfITiXQzn2Qn4KfgtFLguQj0+6mTMsHG7hSNs
9lt/2OOyiXTutD5Oc10tuA49wo5YQ4Luwh1UTMGY1rxpSvCoMHvI//TFCEiK4W5/
/4b5xTjW9a9RJ39u2CmF1fy1RNDCQof8m594uTam6j9B14UvklF2sqqvNVmhY8s+
06/HQPXu1JouoAQWG5K+BiC1syjYE1j3Rgc7mjpSfs4KDylyWM4zAZ96QfwMLOF9
K7dWCb9+pGw52gQdLscjJR2neGacgATi98MVDDCiwTvvzQdJxjMyzto/cosDJydh
nFsrZoD83uSsEDbcB65DFQ55ZCYPp8oPH/1ORuCAUbBy46SLyA==
-----END CERTIFICATE-----`,
    },
};

const client = new pg.Client(config);
client.connect(function (err) {
    if (err)
        throw err;
    client.query("SELECT VERSION()", [], function (err, result) {
        if (err)
            throw err;

        console.log(result.rows[0].version);
        client.end(function (err) {
            if (err)
                throw err;
        });
    });
});