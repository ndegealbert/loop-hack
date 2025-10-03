// Tiny intent + executor (one endpoint)
function nlu(t=""){t=t.toLowerCase();
    if(t.includes("business")) return {type:"journey", id:"start-business"};
    if(t.includes("referral")) return {type:"ref"};
    return {type:"help"};
  }
  async function run(api){
    switch(api){
      case "wallet.open": return {ok:true,msg:"Business wallet opened"};
      case "goal.create": return {ok:true,msg:"Savings goal set KES 50k"};
      case "loan.quote":  return {ok:true,msg:"Loan pre-approve KES 250k @12%"};
      default:            return {ok:false,msg:"Unknown action"};
    }
  }
  export async function POST(req){
    const b = await req.json();
    if(b.text){ // intent
      const i = nlu(b.text);
      if(i.type==="journey") return Response.json({reply:'Starting "Start a Business". Press Run', journeyId:i.id});
      if(i.type==="ref")     return Response.json({reply:`Your referral link:\nhttps://loop.example/ref?r=${Math.random().toString(36).slice(2,8)}`});
      return Response.json({reply:"Try: start a business / referral link"});
    }
    if(b.stepApi){ // execute a step
      const r = await run(b.stepApi);
      return Response.json(r);
    }
    return Response.json({reply:"No action"});
  }
ß  