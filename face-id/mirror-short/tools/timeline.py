import json,re,subprocess,sys
T={ "n1":"Have you ever wondered if you can open your iPhone with your mirror reflection?",
 "n2":"When the phone is awake, these cameras fire",
 "n3a":"over thirty thousand dots straight onto the face, and the infrared camera picks up the pattern.",
 "n5":"But here's the twist: a mirror bounces that light straight back onto my face.",
 "n3c":"So what's the phone really reading? My nose bends the dots one way, my cheeks another, and from those bends, it maps my face.",
 "n3d":"That's why a flat photo fails. Nothing bends.",
 "n4":"It also grabs an infrared picture, then checks both against the face I set up.",
 "n4b":"No match, it stays locked. A match unlocks it.",
 "n6q":"So, did it work?",
 "n6r":"It unlocked for me! Did yours? Tell me in the comments." }
ORDER=["n1","n2","n3a","n5","n3c","n3d","n4","n4b","n6q","n6r"]
# ---- record: one speed for every line ----
json.dump({'order':ORDER,'text':T},open('tools/vo_lines.json','w'),indent=1)
subprocess.run(['python3','tools/vo_eleven.py'],check=True)
L=json.load(open('public/vo/lengths.json'))
def wt(k,word,nth=1):                  # start of a word, seconds into the line (same estimate the captions use)
    ws=T[k].split(); tot=sum(len(w)+1 for w in ws); c=0; acc=0
    for w in ws:
        if w.strip('.,:?!').lower()==word.lower():
            c+=1
            if c==nth: return acc/tot*L[k]
        acc+=len(w)+1
    raise KeyError(word)
R=lambda x: round(x,2); F=lambda x: round(x*30); GAP=0.08
at={}
# hook
at['n1']=0.1; unlock=at['n1']+wt('n1','if'); SRC=2.2
freeze=max(6,F(unlock-0.05-(3.0-SRC))); cut=freeze+53; hookEnd=R((cut+38)/30)
at['n2']=R(max(hookEnd+0.05, at['n1']+L['n1']+GAP))
LEAD=22+F(hookEnd)-cut
fOf=lambda t: LEAD+(t-hookEnd)*30
explain=9999; card=999      # the phone shot ends on 'fire': the parts lift out and light up, nothing more; card=999
td1=R(at['n2']+L['n2']+0.02)      # the two halves of one sentence: no breath between them
at['n3a']=R(td1+0.01); front=F(at['n3a']+wt('n3a','and')-td1)-2; cam=max(20,F(at['n3a']+wt('n3a','picks')-td1)-front-4)
sc1=R(at['n3a']+L['n3a']+0.25)
at['n5']=R(sc1+0.05); mir1=R(sc1+max(L['n5']+0.35,153/30))
at['n3c']=R(mir1+0.05); m0=mir1
cue=dict(face=-20,nose=F(at['n3c']+wt('n3c','nose')-m0),cheek=F(at['n3c']+wt('n3c','cheeks')-m0),cyan=F(at['n3c']+wt('n3c','and')-m0)); cue['bend']=cue['nose']-4; cue['depth']=cue['cyan']+18
at['n3d']=R(at['n3c']+L['n3c']+0.2); cue['photo']=F(at['n3d']-0.05-m0); m1=R(at['n3d']+L['n3d']+0.35); cue['end']=F(m1)-F(m0)
at['n4']=R(m1+0.05); cmp_=dict(both=F(at['n4']+wt('n4','then')-m1)-2,check=F(at['n4']+wt('n4','against')-m1)-2); at['n4b']=R(at['n4']+L['n4']+GAP); cmp_['no']=F(at['n4b']-m1)-1; cmp_['match']=F(at['n4b']+wt('n4b','a')-m1)-2; c1=R(at['n4b']+L['n4b']+0.3)
at['n6q']=R(c1+0.1); unlockT=R(at['n6q']+L['n6q']+0.25); at['n6r']=R(unlockT+0.45); t1=R(at['n6r']+L['n6r']+0.4); e1=R(t1+1.5)
print({k:(at[k],L[k]) for k in ORDER}); print('hook',freeze,cut,hookEnd,'explain',explain,card,'front',front,cam,'cue',cue,'cmp',cmp_,'ends',td1,sc1,mir1,m1,c1,t1,e1)
# ---- script.ts ----
p='src/script.ts'; s=open(p).read()
def block(a,b,new):
    global s
    i=s.index(a); j=s.index(b,i)+len(b); s=s[:i]+new+s[j:]
s=re.sub(r"export const TOTAL = \d+;\s*// [\d.]+ s","export const TOTAL = %d;            // %.1f s"%(F(e1),e1),s)
s=re.sub(r"export const STORY_END = [\d.]+;","export const STORY_END = %s;"%t1,s)
block("export const SCENES = {","} as const;","export const SCENES = {\n  hook: [0, %s], truedepth: [%s, %s], scan: [%s, %s], mirror: [%s, %s], measure: [%s, %s],\n  compare: [%s, %s], test: [%s, %s], end: [%s, %s],\n} as const;"%(hookEnd,hookEnd,td1,td1,sc1,sc1,mir1,mir1,m1,m1,c1,c1,t1,t1,e1))
s=re.sub(r"export const HOOK = \{[^}]*\};","export const HOOK = { srcStart: %s, freeze: %d, cut: %d, handF: 22 };"%(SRC,freeze,cut),s)
rush=unlock-0.05
block("export const CAPTION_PLACEMENT","];","""export const CAPTION_PLACEMENT: { from: number; to: number; top: number }[] = [
  { from: %.2f, to: %.2f, top: 1300 },      // the rush into the reflected phone, then the phone: lower, over his hand
  { from: %.2f, to: %.2f, top: 1680 },      // the push to the top of the phone: caption under the clock
  { from: %.2f, to: %s, top: 1160 },      // the parts use the top -> caption between the island and the clock
  { from: %s, to: %.2f, top: 185 },     // 3D red dots clip: raised to clear his hair and the dots
  { from: %.2f, to: %.2f, top: 1540 },      // top-down mirror diagram: the top holds the face behind the glass -> caption below his head
  { from: %s, to: %.2f, top: 170 },      // the 3D dotted head
  { from: %s, to: %s, top: 170 },      // the photo
  { from: %s, to: %s, top: 170 },     // comparison
  { from: %s, to: %s, top: 96 },     // reveal: the phone fills the frame -> caption above it
];"""%(max(0,rush-0.6),rush+1.4,rush+1.4,at['n2']-0.02,at['n2']-0.02,td1,td1,td1+front/30,sc1+28/30,sc1+106/30,m0,m0+cue['cyan']/30,at['n3d'],m1,m1,c1,c1,t1))
block("export const NARRATION: Line[] = [","];","export const NARRATION: Line[] = [\n"+"".join("  { id: '%s', at: %s, text: %s },\n"%(k,at[k],json.dumps(T[k])) for k in ORDER)+"];")
# Sound effects sit well under the voice: quiet to begin with, and ducked to half of that whenever one lands on a spoken line.
def V(t0,v): return round(v*(0.5 if any(t0 < at[k]+L[k] and t0+0.7 > at[k] for k in ORDER) else 1),3)
S=[('the projector fires its dots','fire.wav',td1-0.05,0.14),('the infrared camera reads the pattern','scan.wav',td1+(front+cam)/30,0.09),
   ('the dots come back off the mirror','fire.wav',sc1+3.9,0.11),('the face is mapped','scan.wav',m0+0.25,0.08),
   ('no match, stays locked','deny.wav',m1+cmp_['no']/30,0.16),('match, unlocks','ok.wav',m1+cmp_['match']/30,0.14),
   ('Face ID scans','scan.wav',c1+0.5,0.12),('Face ID processing','ok.wav',c1+(F(unlockT-c1)-14)/30,0.06),('unlocked','unlock.wav',unlockT,0.2)]
block("export const SFX = [","];","export const SFX = [\n"+"".join("  { name: 'SFX · %s', file: '%s', at: %.2f, vol: %s },\n"%(n,f_,t0,V(t0,v)) for n,f_,t0,v in S)+"];")
s=re.sub(r"resultDelaySec: [\d.]+,","resultDelaySec: %s,"%R(0.1+L['n6q']+0.5),s)
s=re.sub(r'export const UNLOCK_AT = \d+;','export const UNLOCK_AT = %d;'%F(unlockT-c1),s)
open(p,'w').write(s)
def sub(path,pat,rep,count=1):
    x=open(path).read(); x,n=re.subn(pat,rep,x); assert n==count,(path,pat,n); open(path,'w').write(x)
sub('src/Watermark.tsx',r"const k = fr / \d+;","const k = fr / %d;"%F(t1))
sub('src/scenes/PhoneParts.tsx',r"EXPLAIN = \d+, CARD = \d+;","EXPLAIN = %d, CARD = %d;"%(explain,card))
sub('src/scenes/Compare.tsx',r"export const CMP = \{[^}]*\};","export const CMP = { both: %(both)d, check: %(check)d, match: %(match)d, no: %(no)d };"%cmp_)
sub('src/scenes/Scan.tsx',r"export const CUE_A = \{[^}]*\};","export const CUE_A = { front: %d, cam: %d, end: %d };   // front: the switch starts (what you see); cam: frames later, what the camera sees"%(front,cam,F(sc1)-F(td1)))
sub('src/scenes/Scan.tsx',r"export const CUE_B = \{[^}]*\};","export const CUE_B = { face: %(face)d, bend: %(bend)d, nose: %(nose)d, cheek: %(cheek)d, cyan: %(cyan)d, depth: %(depth)d, photo: %(photo)d, end: %(end)d };"%cue)
x=open('src/scenes/Scan.tsx').read()
for a,b in (("w2 = ramp(t, 22, 34, 0, 1, io);","w2 = ramp(t, CUE_A.cam, CUE_A.cam + 12, 0, 1, io);"),
            ("<SeeBadge ir={false} o={ramp(t, 8, 13) * (1 - ramp(t, 22, 27))} />","<SeeBadge ir={false} o={ramp(t, 8, 13) * (1 - ramp(t, CUE_A.cam, CUE_A.cam + 5))} />"),
            ("<SeeBadge ir o={ramp(t, 29, 34)} />","<SeeBadge ir o={ramp(t, CUE_A.cam + 7, CUE_A.cam + 12)} />"),
            ("const G = Math.min(s, 180);","const G = Math.min(s * K, CUE_A.front * K + 16);")):
    x=x.replace(a,b)
open('src/scenes/Scan.tsx','w').write(x)
m=open('src/scenes/Mirror.tsx').read()
a="  const l = useCurrentFrame() + MIR_FROM;\n  if (l >= MIR.diagram"; 
