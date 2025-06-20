import axios from "axios";

const CLIENT_ID = "300746";
const CLIENT_SECRET = "2ee86a66e5d97e3fadc400c9f19b065d";
const POS_ID = "300746";
const PAYU_URL = "https://secure.snd.payu.com";

let accessToken: string | null = null;
let tokenExpire = 0;

async function getAccessToken() {
  if (accessToken && tokenExpire > Date.now()) {
    return accessToken;
  }

  const res = await axios.post(
    `${PAYU_URL}/pl/standard/user/oauth/authorize`,
    "grant_type=client_credentials",
    {
      auth: { username: CLIENT_ID, password: CLIENT_SECRET },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  accessToken = res.data.access_token;
  tokenExpire = Date.now() + (res.data.expires_in - 60) * 1000;
  return accessToken;
}

export async function createPayment(amount: string, email: string) {
  const token = await getAccessToken();

  const extOrderId = `order-${Date.now()}`;
 const nettoZloty = parseFloat(amount);          
  const grosze     = Math.round(nettoZloty * 100) 
  const payload = {
    notifyUrl: "http://192.168.1.111:3000/payment/notify",
    continueUrl: `http://192.168.1.111:3000/payment/confirmed?extOrderId=${extOrderId}`,
    customerIp: "127.0.0.1",
    merchantPosId: POS_ID,
    description: "Opłata za usługę GuardHire",
    currencyCode: "PLN",
    totalAmount: grosze, 
    extOrderId,
    buyer: {
      email,
      firstName: "Jan",
      lastName: "Kowalski",
      language: "pl",
    },
    products: [
      {
        name: "Super Produkt GuardHire",
        unitPrice: grosze,
        quantity: "1",
      },
    ],
  };

  const res = await axios.post(
    `${PAYU_URL}/api/v2_1/orders`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      maxRedirects: 0,
      validateStatus: status => status < 400,
    }
  );


  console.log(res.status);   // 302
console.log(res.data);     // orderId i redirectUri
console.log(res.headers.location); // URL do płatności TEST
  return {
    payuOrderId: res.data.orderId,
    redirectUri: res.data.redirectUri,
    extOrderId,
  };
}