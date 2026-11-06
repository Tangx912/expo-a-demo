import json
w=json.load(open('data/osm-ways.json')); x0,x1,y0,y1=121.488,121.497,31.186,31.195
p=lambda q:((q[0]-x0)/(x1-x0)*850,(y1-q[1])/(y1-y0)*990)
s=['<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1050" style="background:#ecf1ef">']
for a in w:
 t=a['tags']; pts=a['points']; c=[sum(q[i]for q in pts)/len(pts)for i in (0,1)]
 if not(x0<c[0]<x1 and y0<c[1]<y1):continue
 v=' '.join('%.1f,%.1f'%p(q) for q in pts)
 if 'building'in t:
  s.append(f'<polygon points="{v}" fill="#b5c7cf" stroke="#506a78"/>'); X,Y=p(c);s.append(f'<text x="{X}" y="{Y}" font-size="11">{t.get("name",a["id"][-5:])}</text>')
 if 'highway'in t and t['highway']not in ['footway','cycleway','path','steps','service'] and not t.get('tunnel'):
  s.append(f'<polyline points="{v}" fill="none" stroke="#ffffff" stroke-width="9"/>');X,Y=p(c);s.append(f'<text x="{X}" y="{Y}" font-size="10" fill="#aa6655">{t.get("name","")}</text>')
s.append('</svg>');open('data/map-check.svg','w').write(''.join(s))
