(function(){
  var parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',weekday:'short',hour:'numeric',hour12:false}).formatToParts(new Date());
  var wd=parts.find(function(p){return p.type==='weekday'}).value, h=+parts.find(function(p){return p.type==='hour'}).value%24;
  var day=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(wd);
  var hrs={0:null,1:[11,20],2:[11,20],3:[11,20],4:[11,20],5:[11,18],6:[10,16]}[day];
  var open=hrs&&h>=hrs[0]&&h<hrs[1];
  var fmt=function(x){return (x>12?x-12:x)+(x>=12?'pm':'am')};
  var text=open?'Open now · until '+fmt(hrs[1]):'Closed right now';
  document.querySelectorAll('[data-status]').forEach(function(el){el.querySelector('span').textContent=text;if(!open)el.classList.add('closed')});
  document.querySelectorAll('[data-hours] [data-day]').forEach(function(el){if(el.dataset.day.split(',').indexOf(String(day))>-1)el.classList.add('today')});
})();
