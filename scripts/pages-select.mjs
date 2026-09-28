/** Resolve the triggering CI directly; listing lag must never select another source. */
import {checkRun} from './pages-package.mjs';
export async function selectPagesRun({actions,owner,repo,repositoryId,eventName,trigger}) {
 if(eventName==='workflow_run') {
  if(!Number.isSafeInteger(trigger?.id)||trigger.id<=0||!/^[a-f0-9]{40}$/.test(trigger.head_sha??''))throw Error('Missing triggering CI identity');
  const run=(await actions.getWorkflowRun({owner,repo,run_id:trigger.id})).data;
  checkRun(run,repositoryId);
  if(run.id!==trigger.id||run.head_sha!==trigger.head_sha||Number.isSafeInteger(trigger.run_attempt)&&run.run_attempt!==trigger.run_attempt)throw Error('Trigger and fetched CI identity disagree');
  return run;
 }
 if(eventName!=='workflow_dispatch')throw Error('Pages selection requires a completed CI event or explicit workflow dispatch');
 for(let page=1;page<=5;page++) {
  const response=await actions.listWorkflowRuns({owner,repo,workflow_id:'ci.yml',branch:'main',status:'success',per_page:20,page});
  const runs=response.data.workflow_runs;if(!Array.isArray(runs))throw Error('Malformed workflow listing');
  for(const run of runs){try {checkRun(run,repositoryId);}catch{continue;}return run;}
  if(runs.length<20)break;
 }
 throw Error('No successful same-repository main CI is available. Nothing will be deployed.');
}
