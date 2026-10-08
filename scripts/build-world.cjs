const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
let html=fs.readFileSync(path.join(root,'prototype-chief-world.html'),'utf8');
if(process.env.CHIEF_PAYMENT_API){const api=new URL(process.env.CHIEF_PAYMENT_API);if(api.protocol!=='https:'&&!(api.protocol==='http:'&&['127.0.0.1','localhost'].includes(api.hostname)))throw new Error('Payment API must be HTTPS or localhost');html=html.replace('</head>',`<meta name="chief-payment-api" content="${api.href.replace(/\/$/,'').replaceAll('&','&amp;').replaceAll('"','&quot;')}">\n</head>`)}
html=html.replace(/<link rel="stylesheet" href="([^"]+)">/g,(_,file)=>'<style>\n'+fs.readFileSync(path.join(root,file),'utf8').replace(/url\(['"]?(assets\/chief\/[^)'" ]+\.woff2)['"]?\)/g,(_,font)=>`url('data:font/woff2;base64,${fs.readFileSync(path.join(root,font)).toString('base64')}')`)+'\n</style>');
html=html.replace(/<script src="([^"]+)"><\/script>/g,(_,file)=>'<script>\n'+fs.readFileSync(path.join(root,file),'utf8').replace(/<\/script/gi,'<\\/script')+'\n</script>');
html=html.replace('</head>','<!-- DotGothic16 subset license:\n'+fs.readFileSync(path.join(root,'assets/chief/OFL-DotGothic16.txt'),'utf8').replace(/--/g,'—')+'\n-->\n</head>');
fs.writeFileSync(path.join(root,'prototype-chief-world-standalone.html'),html);console.log('World standalone:',Buffer.byteLength(html),'bytes; payments:',process.env.CHIEF_PAYMENT_API?'configured':'preview');
