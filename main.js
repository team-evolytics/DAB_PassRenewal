let passRenewalInterval = setInterval(function(){
    if(window.location.pathname == "/" && $("#body-content > div > div:nth-child(2)").length){
        let fastTrackButton = `<button onclick='addFastTrackPass()' class="primaryCTA">Want the Same Pass as Last Year? Click Here!</button>`;
        $("#body-content > div > div:nth-child(2)").prepend(fastTrackButton);
        clearInterval(passRenewalInterval);
    }
    else if(window.location.search.includes("pft=true")){
        callFRAPI("/api/CheckoutApi/ProductConfigurationComplete?_="+Date.now()).then((configData) => {
             window.location.pathname = "/cart/address-and-payment.aspx";
        });
        clearInterval(passRenewalInterval);
     }
}, 100)


async function callFRAPI(url = '', method = 'GET', data = {}) {
  // Default options are marked with *
  let params = {
    method: method, 
    mode: 'same-origin',
    cache: 'no-cache', 
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      '__RequestVerificationToken': $("#csrfToken").val(),
      'Sec-Fetch-Mode': 'cors'
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'same-origin', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  }
  if(method=='GET'){
    delete params.body;
  }
  
  const response = await fetch(url, params);
  return response.json(); // parses JSON response into native JavaScript objects
}

function getCurrentDate(){
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();
    
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    
    return(yyyy + '-' + mm + '-' + dd);
      
}


window.passMap = {
  "AD Tahoe Local Pass 20/21": "157126"
}

window.addFastTrackPass = () => {
  if(digitalData.user){
    let ipCode = digitalData.user.profile.profileInfo.rposID;
    FR.$el.window.trigger("loading-spinner-on", [".main-container"]);
    callFRAPI("/api/TransactionApi/GetTransactionHistory/"+ipCode).then((data) =>{
      console.log(data);
      let passId = 
        window.passMap[data.filter((e) => e.SeasonPassTransactionHistories.length > 0 )[1].SeasonPassTransactionHistories[1].SeasonPassProductTitle]
      let passData = {
          isPassAutoRenew: false,
          passesToAddToCart: [
              {
                  productType: "SeasonPasses",
                  qty: 1,
                  sku: passId,
                  startDate: getCurrentDate()
              }
          ]
      }
      callFRAPI('/api/CartApi/AddPassesToCart', 'POST', passData).then((cartData) => {
        console.log(cartData);
        passConfiguration = {
            "IsAutoRenew": false,
            "cartProductId": cartData.CartProductIds[0],
            "ErolAccepted": true,
            "AttachResortCharge": false,
            "IsResortAccessAccepted": false
        }
        //Object.defineProperty(document, "referrer", {get : function(){ return "https://ep.qa.vailresorts.com/cart/configure-products.aspx"; }});
        //window.history.replaceState(null, '', 'https://ep.qa.vailresorts.com/cart/configure-products.aspx');
        callFRAPI("/api/CartApi/ConfigureSeasonPass", "POST", passConfiguration).then(() => {
          window.location.href="/cart/configure-products.aspx?pft=true";
        });
      });
    })
  }
}
