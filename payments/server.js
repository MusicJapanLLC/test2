import {createService} from './service.js';
const service=createService();
const port=Number(process.env.PORT||4242);
service.server.listen(port,process.env.HOST||'127.0.0.1',()=>console.log('Payment service listening on port '+port));
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>{
  service.server.close(()=>{service.close();process.exit(0);});
  setTimeout(()=>process.exit(1),10000).unref();
});
