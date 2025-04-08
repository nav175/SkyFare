exports.handler = async (event, context) => {
    const CLIENT_ID = process.env.AMADEUS_API_KEY;
    const CLIENT_SECRET = process.env.AMADEUS_API_SECRET;

    const authUrl = "https://test.api.amadeus.com/v1/security/oauth2/token";
    
    try {
        const response = await fetch(authUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                grant_type: "client_credentials",
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET
            })
        });

        const data = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch access token" })
        };
    }
};
