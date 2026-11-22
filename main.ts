import{mkdirSync,readdirSync,readFileSync,writeFileSync}from"node:fs";
import{join}from"node:path";
// Tiny stack VM for make.fun's ISA v1 (see kit program/generator/subject/ISA.md).
// One run answers every instance in MAKEFUN_INPUT_DIR, writing stdout.bin + exit.txt
// per instance under MAKEFUN_OUTPUT_DIR. 32-bit wrapping ints, 256-value stack,
// 64-entry call stack, 256 words of memory, 1e6 steps, 65536 output bytes.
// Trap order per step: step limit, pc range, unknown opcode, truncated immediate,
// stack underflow/overflow, then the instruction's own trap; a trap keeps prior output.
// Opcode table: "byte,immediate-bytes,pops,pushes" per opcode (decimal bytes).
const im=new Uint8Array(256),po=new Uint8Array(256),pu=new Uint8Array(256),ok=new Uint8Array(256);
for(const t of "0,0,0,0 1,1,0,1 2,4,0,1 3,0,1,0 4,0,1,2 5,0,2,2 6,0,2,3 7,0,3,3 16,0,2,1 17,0,2,1 18,0,2,1 19,0,2,1 20,0,2,1 21,0,2,1 22,0,2,1 23,0,1,1 24,0,2,1 25,0,2,1 26,0,2,1 27,0,1,1 28,0,2,1 29,0,2,1 30,0,2,1 32,0,2,1 33,0,2,1 34,0,2,1 48,2,0,0 49,2,1,0 50,2,1,0 51,2,0,0 52,0,0,0 64,0,1,1 65,0,2,0 80,0,1,0 81,0,1,0 82,0,0,1 83,0,1,0".split(" ")){const v=t.split(",").map(Number);ok[v[0]]=1;im[v[0]]=v[1];po[v[0]]=v[2];pu[v[0]]=v[3];}
function run(p:Uint8Array,q:Uint8Array):[Uint8Array,number]{
 const n=p.length,D=new Int32Array(256),C=new Int32Array(64),M=new Int32Array(256),o=new Uint8Array(65536);
 let s=0,c=0,pc=0,st=0,ip=0,ol=0;
 const done=(e:number):[Uint8Array,number]=>[o.slice(0,ol),e];
 for(;;){
  if(st===1e6)return done(10);
  if(pc<0||pc>=n)return done(9);
  const op=p[pc];
  if(!ok[op])return done(5);
  const m=im[op];
  if(pc+m>=n)return done(9);
  st++;
  const nx=pc+1+m;
  if(s<po[op])return done(2);
  if(s-po[op]+pu[op]>256)return done(3);
  pc=nx;
  if(op===0)return done(0);
  if(op===1){D[s++]=(p[nx-1]<<24)>>24;continue;}
  if(op===2){D[s++]=p[nx-4]|(p[nx-3]<<8)|(p[nx-2]<<16)|(p[nx-1]<<24);continue;}
  if(op===3){s--;continue;}
  if(op===4){D[s]=D[s-1];s++;continue;}
  if(op===5){const t=D[s-1];D[s-1]=D[s-2];D[s-2]=t;continue;}
  if(op===6){D[s]=D[s-2];s++;continue;}
  if(op===7){const a=D[s-3];D[s-3]=D[s-2];D[s-2]=D[s-1];D[s-1]=a;continue;}
  if(op===23){D[s-1]=-D[s-1]|0;continue;}
  if(op===27){D[s-1]=~D[s-1];continue;}
  if(op>=16&&op<=34&&op!==23&&op!==27&&op!==31){
   const b=D[s-1],a=D[s-2];let r=0;
   if(op===16)r=(a+b)|0;
   else if(op===17)r=(a-b)|0;
   else if(op===18)r=Math.imul(a,b);
   else if(op===19){if(!b)return done(4);r=a===-2147483648&&b===-1?a:(a/b)|0;}
   else if(op===20){if(!b)return done(4);r=b===-1?0:(a%b)|0;}
   else if(op===21){if(!b)return done(4);r=Math.floor((a>>>0)/(b>>>0))|0;}
   else if(op===22){if(!b)return done(4);r=((a>>>0)%(b>>>0))|0;}
   else if(op===24)r=a&b;
   else if(op===25)r=a|b;
   else if(op===26)r=a^b;
   else if(op===28)r=a<<(b&31);
   else if(op===29)r=a>>(b&31);
   else if(op===30)r=(a>>>(b&31))|0;
   else if(op===32)r=a===b?1:0;
   else if(op===33)r=a<b?1:0;
   else r=(a>>>0)<(b>>>0)?1:0;
   s-=2;D[s++]=r;continue;
  }
  if(op>=48&&op<=50){
   const rel=((p[nx-2]|(p[nx-1]<<8))<<16)>>16;
   let t=op===48;
   if(op!==48){const v=D[--s];t=op===49?v===0:v!==0;}
   if(t)pc=nx+rel;
   continue;
  }
  if(op===51){if(c===64)return done(7);C[c++]=nx;pc=p[nx-2]|(p[nx-1]<<8);continue;}
  if(op===52){if(!c)return done(8);pc=C[--c];continue;}
  if(op===64){const a=D[s-1];if(a<0||a>255)return done(6);D[s-1]=M[a];continue;}
  if(op===65){const a=D[s-1],v=D[s-2];if(a<0||a>255)return done(6);s-=2;M[a]=v;continue;}
  if(op===80){const t=String(D[s-1]);if(ol+t.length>65536)return done(11);s--;for(let i=0;i<t.length;i++)o[ol++]=t.charCodeAt(i);continue;}
  if(op===81){if(ol+1>65536)return done(11);o[ol++]=D[--s]&255;continue;}
  if(op===82){D[s++]=ip<q.length?q[ip++]:-1;continue;}
  if(op===83)return done(D[--s]&255);
 }
}
const I=process.env.MAKEFUN_INPUT_DIR??"/input",O=process.env.MAKEFUN_OUTPUT_DIR??"/output";
for(const d of readdirSync(I).sort()){
 let q=new Uint8Array(0);
 try{q=new Uint8Array(readFileSync(join(I,d,"input.bin")))}catch{}
 const r=run(new Uint8Array(readFileSync(join(I,d,"program.bin"))),q);
 mkdirSync(join(O,d),{recursive:true});
 writeFileSync(join(O,d,"stdout.bin"),r[0]);
 writeFileSync(join(O,d,"exit.txt"),r[1]+"\n");
}
