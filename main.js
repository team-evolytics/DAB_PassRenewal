
let passRenewalInterval = setInterval(function(){
  if(window.location.pathname == "/" && $("#body-content > div > div:nth-child(2)").length){
      let fastTrackButton = `<button onclick='addFastTrackPass()' class="primaryCTA">Want the Same Pass as Last Year? Click Here!</button>`;
      $("#body-content > div > div:nth-child(2)").prepend(fastTrackButton);
      // trimSignInModal();
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
  , "Epic Pass": "149259"
  , "Northeast Value Pass": "149730"
  , "Summit Value Pass": "149613"
  , "Snow Creek Pass": "159237"
}

window.addFastTrackPass = () => {
  var authStatus = digitalData.user.attributes.authenticationStatus;
  if (authStatus !== 'logged out'){
    if(digitalData.user){
      let ipCode = digitalData.user.profile.profileInfo.rposID;
      FR.$el.window.trigger("loading-spinner-on", [".main-container"]);
      callFRAPI("/api/TransactionApi/GetTransactionHistory/"+ipCode).then((data) =>{
        console.log(data);

        // let passId = window.passMap[data.filter((e) => e.SeasonPassTransactionHistories.length > 0 )[1].SeasonPassTransactionHistories[1].SeasonPassProductTitle]
        let passId = window.passMap[getSessionStorage()];

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
              // issue here
              "cartProductId": cartData.CartProductIds[0],
              "ErolAccepted": true,
              "AttachResortCharge": false,
              "IsResortAccessAccepted": false
          }
          // console.log(cartData.CartProductIds[0]);

          //Object.defineProperty(document, "referrer", {get : function(){ return "https://ep.qa.vailresorts.com/cart/configure-products.aspx"; }});
          //window.history.replaceState(null, '', 'https://ep.qa.vailresorts.com/cart/configure-products.aspx');
          callFRAPI("/api/CartApi/ConfigureSeasonPass", "POST", passConfiguration).then(() => {
            window.location.href="/cart/configure-products.aspx?pft=true";
          });
        });
      })
    }
  } else if (authStatus === 'logged out') {
    // console.log('sign in');
    $('#mainNavInner > div.main_nav__utility > ul > li:nth-child(3)').addClass('main_nav__utility_item hover').then(trimSignInModal());
  }
}

// proof of concept
function trimSignInModal(){
  $('#mainNavInner > div.main_nav__utility > ul > li.main_nav__utility_item.hidden-md.hidden-sm.hidden-xs > div > div.main_nav__dropdown__content > div > div').css({'border-right':'0px','padding-right':'25px'});
  $('#mainNavInner > div.main_nav__utility > ul > li.main_nav__utility_item.hidden-md.hidden-sm.hidden-xs > div > div.main_nav__dropdown__content').css({'width':'410px'});
  $('#mainNavInner > div.main_nav__utility > ul > li.main_nav__utility_item.hidden-md.hidden-sm.hidden-xs > div > div.main_nav__dropdown__content > div > div.main_nav__dropdown__content-column.accountLoginPage__continueAsGuestContainer.view_panel').hide();

  fixSignInModal();
}

function fixSignInModal(){
  $('#mainNavInner > div.main_nav__utility > ul > li.main_nav__utility_item.hidden-md.hidden-sm.hidden-xs > a').on('mouseenter', () => {
    $('#mainNavInner > div.main_nav__utility > ul > li.main_nav__utility_item.hidden-md.hidden-sm.hidden-xs > div > div.main_nav__dropdown__content > div > div').css({'border-right':'1px solid #ccc'});
    $('#mainNavInner > div.main_nav__utility > ul > li.main_nav__utility_item.hidden-md.hidden-sm.hidden-xs > div > div.main_nav__dropdown__content').css({'width':'100%'});
    $('#mainNavInner > div.main_nav__utility > ul > li.main_nav__utility_item.hidden-md.hidden-sm.hidden-xs > div > div.main_nav__dropdown__content > div > div.main_nav__dropdown__content-column.accountLoginPage__continueAsGuestContainer.view_panel').show();  
  });
}

function setSessionStorage(product){
  /*
  for (let i = 0; i < product_ls.length; i++){
    window.sessionStorage.setItem('renewalPassProduct'+i,product_ls[i]);
  }
  */
  window.sessionStorage.setItem('renewalPassProduct',product);
}
function getSessionStorage(){
  let product = window.sessionStorage.getItem('renewalPassProduct');
  return product
}

// session storage needs to be set some other way
// setSessionStorage('AD Tahoe Local Pass 20/21');
setSessionStorage('Snow Creek Pass');
// etSessionStorage(['AD Tahoe Local Pass 20/21','Epic Pass']);




/*
window.passMap = {
  "AD Tahoe Local Pass 20/21": "157126"
  // "Epic Pass": "149259"
}
*/

