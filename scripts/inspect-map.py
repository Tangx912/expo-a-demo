import xml.etree.ElementTree as E,json,collections
r=E.parse('data/osm-map.xml').getroot(); ns={n.attrib['id']:[float(n.attrib['lon']),float(n.attrib['lat'])] for n in r.findall('node')}; ways=[]
for w in r.findall('way'):
 t={x.attrib['k']:x.attrib['v'] for x in w.findall('tag')}; p=[ns[n.attrib['ref']] for n in w.findall('nd') if n.attrib['ref'] in ns]
 if p: ways.append(dict(id=w.attrib['id'],tags=t,points=p))
json.dump(ways,open('data/osm-ways.json','w'),ensure_ascii=False)
for w in ways:
 t=w['tags']; p=w['points']; c=[sum(x[i] for x in p)/len(p) for i in (0,1)]
 if 'building' in t or ('highway'in t and t.get('name')): print(w['id'],t, [round(x,6) for x in c])
print('WAYS',len(ways))
