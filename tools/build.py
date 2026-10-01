import base64,json,os,glob
def uri(path,mime): return f'data:{mime};base64,'+base64.b64encode(open(path,'rb').read()).decode()
img={os.path.basename(p)[:-4]:uri(p,'image/png') for p in sorted(glob.glob('build/sp/*.png'))}
snd={os.path.basename(p)[:-4]:uri(p,'audio/mpeg') for p in sorted(glob.glob('build/snd/*.mp3'))}
jpg=[uri(f'spaceward/Contents/Resources/{i:02d}.jpg','image/jpeg') for i in range(1,26)]
assets={'img':img,'snd':snd,'jpg':jpg,'theme':uri('build/theme.mp3','audio/mpeg')}
data=json.load(open('src/data.json'))
shell=open('src/shell.html').read()
scripts=('<script>window.ASSETS='+json.dumps(assets)+';window.HODATA='+json.dumps(data)+';</script>\n'
 '<script>\n'+open('src/engine.js').read()+'\n</script>\n<script>\n'+open('src/ui.js').read()+'\n</script>')
os.makedirs('/mnt/user-data/outputs',exist_ok=True)
out=shell.replace('<!--SCRIPTS-->',scripts)
open('/mnt/user-data/outputs/spaceward-ho.html','w').write(out)
print(len(out)/1e6,'MB')
