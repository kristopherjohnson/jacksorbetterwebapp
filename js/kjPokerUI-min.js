(function(){function s(a,b){$.each(n,function(e,i){if(!(a&&g[e])){e=c.cardAtIndex(e).imagePath();b?i.attr("src",e):i.animateImageChange(e)}})}function B(a){var b=c.lastHandScore().scoringCardIndexes();$.each(n,function(e,i){if($.inArray(e,b)==-1)a?i.css("opacity",0.5):i.fadeTo("normal",0.5)})}function o(a){var b=c.credits();if(b!==C){a?t.text(""+b):t.animateTextChange(""+b);C=b}}function N(){$.each(l,function(a,b){g[a]=false;b.html(m).attr("opacity",1)});D()}function E(a){$.each(l,function(b,e){a?
e.css("opacity",0.6):e.fadeTo("fast",0.6)})}function O(a){if(g[a]){g[a]=false;l[a].animateHtmlChange(m)}else{g[a]=true;l[a].animateHtmlChange("Hold")}D()}function p(a){function b(d,f,j){d=d||m;f=f||m;j=j||m;if(a){u.html(d);v.html(f);w.html(j)}else{u.animateHtmlChange(d);v.animateHtmlChange(f);w.animateHtmlChange(j)}}var e=c.playState();if(e===h.gameIdle)b("Jacks or Better Poker","You start with 100 credits","Tap the Deal button to begin");else if(e===h.gameStarted)b(null,"Tap the cards you want to hold",
"Tap the Draw button to continue");else if(e===h.afterDraw)b(null,null,null);else if(e===h.gameEnded){function i(){var d=c.lastHandScore();return d.name()===P.loss.name()?null:d.name()}function q(){var d=c.lastHandPayout();return d?'You won <span class="payout">'+d+"</span> credits!":"You did not win"}c.credits()>0?b(i(),q(),"Tap the Deal button to play again"):b("Out of credits",q(),"Tap New Game to start over")}}function x(){var a=c.playState();if(a===h.gameIdle)k.text("Deal");else if(a===h.gameStarted)k.text("Draw");
else if(a!==h.afterDraw)if(a===h.gameEnded)c.credits()>0?k.text("Deal"):k.text("New Game")}function F(a){function b(){$.each(g,function(e,i){i||c.discardAtIndex(e)})}if(c.playState()===h.gameStarted){k.blink();b();c.draw()}else{c.credits()<=0&&c.addCredits(100);k.blink();c.shuffleAndDeal()}a.preventDefault()}function G(a){var b=a.data;if(c.playState()===h.gameStarted){n[b].blink();O(b)}a.preventDefault()}function Q(){y();o();N();s();p();x()}function R(){y();o();E();s(true);p();window.setTimeout(function(){c.scoreHand()},
1E3)}function S(){y();o();B();p();x()}function H(){c.onDealComplete=Q;c.onDrawComplete=R;c.onGameEnded=S}function D(){g&&r&&localStorage.setItem(I,JSON.stringify(g))}function T(){var a;if(r)if(a=localStorage.getItem(I))if(a=JSON.parse(a)){g=a;$.each(g,function(b,e){l[b].html(e?"Hold":m)});c.playState()===h.gameEnded&&E(true)}}function y(){c&&r&&c.storeTo(localStorage,J)}function U(){var a;if(r)if(a=K.restoreFrom(localStorage,J)){c=a;H();o(true);s(false,true);c.playState()===h.gameEnded&&B(true);p(true);
x(true);return true}return false}function V(){function a(){return navigator.userAgent.match(/iPhone/i)||navigator.userAgent.match(/iPod/i)}function b(){function d(){var j,z;j=f.drawCard().imagePath();z=document.createElement("img");z.src=j;L.push(z);f.cardCount()>0&&window.setTimeout(d,1)}var f;f=new W;L=[];d()}function e(){if(!U()){c=new K;H()}}function i(){var d,f,j;t=$("#credits");n=[];l=[];g=[];for(d=0;d<5;++d){f=$("#card"+d.toString());j=$("#hold"+d.toString());n.push(f);l.push(j);g.push(false);
f.bind("mousedown",d,G)}u=$("#upperstatusline");v=$("#middlestatusline");w=$("#lowerstatusline");k=$("#dealdrawbutton");k.mousedown(F)}function q(){$(document).keypress(function(d){var f=d.keyCode||d.which;switch(f){case 32:F(d);break;case 49:case 50:case 51:case 52:case 53:d.data=f-49;G(d);break}})}A=a();i();q();e();T();A&&window.scrollTo(0,1);A||b()}var M=kjPoker.Card,W=kjPoker.Deck,K=kjPoker.Session,h=kjPoker.PlayState,P=kjPoker.Score,c,t,n,l,g,u,v,w,k,C,m="&nbsp;",A,L,r=typeof localStorage!==
"undefined",J="kjPoker-Session",I="kjPoker-IsCardHeld";M.prototype.imagePath=function(){return"images/card/"+this.abbrev()+".png"};M.backImagePath=function(){return"images/card/back.png"};jQuery.fn.animateImageChange=function(a){return this.each(function(){var b=$(this);b.fadeTo(50,0,function(){b.attr("src",a);window.setTimeout(function(){b.fadeTo(100,1)},200)})})};jQuery.fn.animateTextChange=function(a){return this.each(function(){var b=$(this);b.fadeTo(50,0,function(){b.text(a);b.fadeTo(200,1)})})};
jQuery.fn.animateHtmlChange=function(a){return this.each(function(){var b=$(this);b.fadeTo(50,0,function(){b.html(a);b.fadeTo(200,1)})})};jQuery.fn.blink=function(){return this.each(function(){var a=$(this);a.fadeTo(50,0,function(){a.fadeTo(200,1)})})};kjPoker.startUI=V})();$(document).ready(function(){kjPoker.startUI()});