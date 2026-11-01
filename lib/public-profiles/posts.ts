import type {GymLocale} from '@/lib/seo';
export type PublicPost = {id:string;createdAt:string;image:string;likes:number;comments:number};
export const postCopy:Record<GymLocale,readonly [string,string,string,string,string]>={
 sk:['Príspevky','Zatiaľ žiadne verejné príspevky.','Zdieľaný tréning','Páči sa mi','Komentáre'],
 en:['Posts','No public posts yet.','Shared workout','Likes','Comments'],
 de:['Beiträge','Noch keine öffentlichen Beiträge.','Geteiltes Training','Gefällt mir','Kommentare'],
 es:['Publicaciones','Aún no hay publicaciones públicas.','Entrenamiento compartido','Me gusta','Comentarios'],
 fr:['Publications','Aucune publication publique pour le moment.','Entraînement partagé','J’aime','Commentaires'],
 pl:['Posty','Nie ma jeszcze publicznych postów.','Udostępniony trening','Polubienia','Komentarze'],
 'zh-Hans':['动态','暂无公开动态。','分享的训练','赞','评论']
};
export function validPostId(id:string){return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);}
