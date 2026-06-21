import { Controller, Get, Param, Header } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '@common/decorators';
import { ConfigService } from '@nestjs/config';
import { TRACKING_SCRIPT_VERSION } from '@wao/shared';

@ApiTags('Tracking Script')
@Controller('v1/script')
export class ScriptController {
  constructor(private readonly configService: ConfigService) {}

  @Public()
  @Get(':workspaceId')
  @Header('Content-Type', 'application/javascript')
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({ summary: 'Serve the tracking script for a workspace' })
  getScript(@Param('workspaceId') workspaceId: string): string {
    const apiUrl = this.configService.getOrThrow('API_URL');

    return `
// WhatsApp Attribution OS Tracking Script v${TRACKING_SCRIPT_VERSION}
// (c) Claw Labs — https://clawlabs.com
(function(w,d){
  'use strict';
  var API='${apiUrl}/api/v1/track/click';
  var WID='${workspaceId}';

  function getParam(n){
    var u=new URLSearchParams(w.location.search);
    return u.get(n)||'';
  }

  function genUid(){
    var c='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',u='WAO-';
    for(var i=0;i<6;i++)u+=c[Math.floor(Math.random()*c.length)];
    return u;
  }

  function init(){
    var uid=genUid();
    var data={
      workspaceId:WID,uid:uid,
      gclid:getParam('gclid'),fbclid:getParam('fbclid'),
      ttclid:getParam('ttclid'),msclkid:getParam('msclkid'),
      li_fat_id:getParam('li_fat_id'),
      utm_source:getParam('utm_source'),utm_medium:getParam('utm_medium'),
      utm_campaign:getParam('utm_campaign'),utm_content:getParam('utm_content'),
      utm_term:getParam('utm_term'),
      landingPage:w.location.href,referer:d.referrer
    };

    // Only track if there's an ad click ID or UTM params
    if(!data.gclid&&!data.fbclid&&!data.ttclid&&!data.msclkid&&!data.li_fat_id&&!data.utm_source)return;

    // Send click data to API
    if(navigator.sendBeacon){
      navigator.sendBeacon(API,JSON.stringify(data));
    }else{
      var x=new XMLHttpRequest();
      x.open('POST',API,true);
      x.setRequestHeader('Content-Type','application/json');
      x.send(JSON.stringify(data));
    }

    // Modify WhatsApp buttons to include UID
    function modifyButtons(){
      var links=d.querySelectorAll('a[href*="wa.me"],a[href*="whatsapp.com"],a[href*="api.whatsapp.com"],.wao-whatsapp-btn');
      for(var i=0;i<links.length;i++){
        var href=links[i].getAttribute('href');
        if(!href)continue;
        var sep=href.indexOf('?')>-1?'&':'?';
        var ref=encodeURIComponent('Ref: '+uid);
        if(href.indexOf('text=')>-1){
          href=href.replace(/text=([^&]*)/,'text=$1%20'+ref);
        }else{
          href=href+sep+'text='+ref;
        }
        links[i].setAttribute('href',href);
      }
    }

    if(d.readyState==='loading'){
      d.addEventListener('DOMContentLoaded',modifyButtons);
    }else{
      modifyButtons();
    }

    // Also observe DOM for dynamically added buttons
    if(w.MutationObserver){
      new MutationObserver(modifyButtons).observe(d.body||d.documentElement,{childList:true,subtree:true});
    }
  }

  if(d.readyState==='loading'){
    d.addEventListener('DOMContentLoaded',init);
  }else{
    init();
  }
})(window,document);
`.trim();
  }
}
