import subprocess, sys, numpy as np
def bad(f):
    w,h=108,192
    raw=subprocess.run(['ffmpeg','-v','error','-i',f,'-vf',f'scale={w}:{h},format=gray','-f','rawvideo','-'],capture_output=True).stdout
    a=np.frombuffer(raw,np.uint8).reshape(-1,h,w).astype(float); m=a.mean((1,2))
    out=[]
    for i in range(1,len(m)-1):
        nb=(m[i-1]+m[i+1])/2
        if abs(m[i]-nb)>max(8,0.25*nb) and abs(m[i-1]-m[i+1])<0.08*nb+2: out.append(i)
    return len(m),out
if __name__=='__main__':
    for f in sys.argv[1:]:
        n,o=bad(f); print(f"{f:40s} frames={n} glitch_frames={len(o)} {o[:12]}")
