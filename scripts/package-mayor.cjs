/* Copies only the reviewed standalone to an isolated static release directory. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const target=path.resolve(process.argv[2]||'/tmp/music-japan-mayor-release');
const source=path.resolve(__dirname,'../prototype-chief-world-standalone.html');
const html=fs.readFileSync(source);
if(/<script src=|<link rel="stylesheet"/.test(html.toString()))throw Error('Expected self-contained World build');
fs.mkdirSync(target,{recursive:true});fs.writeFileSync(path.join(target,'index.html'),html);
fs.writeFileSync(path.join(target,'release.json'),JSON.stringify({game:'村長、世界まで行くんですか？',edition:'CARAVAN05-18',saveNamespace:'guild-chief-world-v3',sha256:crypto.createHash('sha256').update(html).digest('hex'),bytes:html.length},null,2));
console.log(target);
