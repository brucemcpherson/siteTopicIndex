/** will return summarized version of all topics and page stats for a site
 * this looks up popularity data generated from analytics
 **/
function doGet(e) {

  e =  e || {parameter:{}};

  // get the site we are dealing with
  siteCode = e.parameter.sitecode || 'ramblings';
  
  // do the work
  var result = {
    stats: doSomething(e),
    params: e.parameter
  };
  
  // prepare the result
  var s = JSON.stringify(result);
  
  // publish result
  return ContentService
    .createTextOutput(result.params.callback ? result.params.callback + "(" + s + ")" : s )
    .setMimeType(result.params.callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON); 

}


function doSomething(e) {
  var site;

  // get a handle to the database
  var dataHandle = cSiteStats.getDataHandle(siteCode);
  
  // get all the site data
  var result = dataHandle.query(
    {"page.topicRoot":true},
    {sort:"-topic.plusOnes"}
  );
  
  if (result.handleCode < 0) {
      throw 'failed to read site data:' + result.handleError;
  };

  var data = result.data.map (function (d) {
    return {
      name:d.topic.title,
      plusOnes:d.topic.plusOnes,
      url:d.page.url,
      pageViews:d.topic.analytics.map (function(d) {
        return {period:d.name , pageViews:d.pageViews};
      })
    }
  });

  return data;
}