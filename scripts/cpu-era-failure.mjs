import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
/** Keep the first verifier failure as a separate diagnostic. Inputs and raw
 * reports remain untouched; this function can never emit a passed ledger. */
export function retainCpuEraFailure(dir,error,identity){
 const receipt={schema:'chrono-cpu-era-source-failure-v1',status:'failed',accepted:false,
  sourceSha:identity.sourceSha,runId:identity.runId,runAttempt:identity.runAttempt,error:{name:String(error?.name??'Error'),message:String(error?.message??error),
   stack:typeof error?.stack==='string'?error.stack:null,observation:error?.observation??null},
  report:null,reportReadError:null,physicalDeviceApproved:false,artApproved:false};
 try{
  const raw=readFileSync(join(dir,'report.json'));
  receipt.report={path:'report.json',bytes:raw.length,sha256:createHash('sha256').update(raw).digest('hex')};
 }catch(readError){receipt.reportReadError=String(readError?.message??readError);}
 writeFileSync(join(dir,'source-failure.json'),JSON.stringify(receipt,null,2)+'\n');return receipt;
}
