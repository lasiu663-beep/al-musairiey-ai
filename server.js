import 'dotenv/config';
import express from 'express';
import OpenAI from 'openai';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({limit:'2mb'}));
app.use(express.static(path.join(__dirname,'public')));
let products=[];
try { products=JSON.parse(await fs.readFile(path.join(__dirname,'data/products.json'),'utf8')); } catch {}
function findProducts(q){const terms=q.toLowerCase().split(/\s+/).filter(x=>x.length>2);return products.map(p=>({...p,score:terms.reduce((n,t)=>n+([p.name,p.code,p.category,p.description].join(' ').toLowerCase().includes(t)?1:0),0)})).filter(p=>p.score>0).sort((a,b)=>b.score-a.score).slice(0,8)}
app.post('/api/chat',async(req,res)=>{try{const message=String(req.body?.message||'').trim();if(!message)return res.status(400).json({error:'Please enter a question.'});if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'لم يتم إعداد خدمة الذكاء الاصطناعي بعد. يرجى التواصل مع مسؤول الموقع.'});const matches=findProducts(message);const context=matches.length?matches.map((p,i)=>`${i+1}. ${p.name}\nCode: ${p.code||'غير منشور'}\nCategory: ${p.category||'غير محدد'}\nDetails: ${p.description||'لا توجد تفاصيل منشورة'}\nURL: ${p.url||''}`).join('\n\n'):'لم يتم العثور على تطابق في الكتالوج المستورد.';const ai=new OpenAI({apiKey:process.env.OPENAI_API_KEY});const out=await ai.chat.completions.create({model:'gpt-4o-mini',temperature:.2,messages:[{role:'system',content:'أنت مساعد منتجات شركة المصيريعي. اكتشف لغة العميل وأجب باللغة نفسها. استخدم فقط بيانات الكتالوج المعطاة لأي معلومة عن المنتجات. لا تخترع أكواداً أو مواصفات أو أسعاراً أو مخزوناً. إذا لم تتوفر معلومة فقل ذلك بوضوح ووجّه العميل إلى واتساب الشركة +966502618568.'},{role:'user',content:`سؤال العميل: ${message}\n\nبيانات الكتالوج:\n${context}`} ]});res.json({answer:out.choices[0]?.message?.content||'تعذر إعداد إجابة.',matches:matches.map(({name,code,url})=>({name,code,url}))});}catch(e){console.error(e);res.status(500).json({error:'حدث خطأ. حاول مجدداً أو تواصل عبر واتساب.'})}});
app.get('/api/status',(_,res)=>res.json({ready:Boolean(process.env.OPENAI_API_KEY),products:products.length}));
app.listen(process.env.PORT||3000,()=>console.log('Al Musairiey AI started'));
