
export default function FetchInfo(nodes){

    let sizelimit = parseInt(nodes[0].msc.pts.length/50);

    let psize = [];
    let schart = new Array(sizelimit);

    schart.fill(0);
    nodes.forEach(d=>{
        if(d.pts.length<sizelimit-1){
            schart[d.pts.length]++;
        }
        else
            schart[sizelimit-1]++;
        psize.push(d.lvl);
    })

    for (let i = schart.length - 1; i > 0; i--) {
        schart[i - 1] = schart[i - 1] + schart[i];
    }
    let uniqueP = [...new Set(psize)].sort(function(a, b) {
        return b - a;
    });
    let pchart = [];
    uniqueP.forEach(d=>{
        let prev = (pchart.length!=0)?pchart[pchart.length-1][1]:0;

        pchart.push([d,(psize.filter(x=>x===d).length+prev)])});

    return [pchart, schart];
}
