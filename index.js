import {promises} from "fs";
import express from "express";
import timesRouter from "./routes/times.js"

const {readFile,writeFile} = promises;
const times=[];

init();

const app = express();
app.use(express.json());

app.listen(3030,()=>{
    console.log("API Started");
});

app.use("/times",timesRouter);

async function init(){
    try{
        const resp = await readFile("./2003.json");
        const data = JSON.parse(resp);
        
        //montando array de times
        data[0].partidas.forEach(partida => {
            times.push({time: partida.mandante, pontuacao:0});
            times.push({time:partida.visitante,pontuacao:0});
        });

        //montando pontuação dos times no array criado
        data.forEach(rodada=>{
            rodada.partidas.forEach(partida=>{
                if (partida.placar_visitante > partida.placar_mandante){
                    const index = times.findIndex(item=>item.time === partida.visitante);
                    times[index].pontuacao+=3;
                } else if (partida.placar_mandante > partida.placar_visitante){
                    const index = times.findIndex(item=>item.time === partida.mandante);
                    times[index].pontuacao+=3;
                }else{
                    const indexMandante = times.findIndex(item=>item.time === partida.mandante);
                    const indexVisitante = times.findIndex(item=>item.time === partida.visitante);                    
                    times[indexMandante].pontuacao+=1;
                    times[indexVisitante].pontuacao+=1;
                }
            })
        });

        //ordenar times pela pontuação
        times.sort((a,b)=>{
            return b.pontuacao  - a.pontuacao;
        });

        console.log(times);

        //Salvando array de times ordenado pela pontuação
        await writeFile("times.json",JSON.stringify(times));
    } catch(err){
        console.log(err);
    }
}