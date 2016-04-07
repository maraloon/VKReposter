/*
1. Читаем из файла последний id репоста
2. Переходим поочередно на +1 id репоста
2.1 Проверка
2.3 При истине делаем репост
   При закрытом посте идём далее
   При несуществующем посте делаем id -1 и записываем в файл

   
Todo
+Репост репоста - только вступить в группу
разобраться с timeout скрипта - галка в диалоге
+Не репостить там где в URL есть reply
+Игнор постов: объявление победителей, о мошенниках


Сделать скрипт удаления старых записей (больше 2х месяцев) 
   

   */
var publics=[
 "79525017",		// Оф Бесплатный
"104838176",	// Гаджеты
"106880889",	// Украина
 "106880652",	// Россия
"106881005",	// Беларусь
"106881135",	// Казахстан
"104838323",	// Сладости
"111410417",	// Сладости
"109957073",	// Сладости
"109956875",	// Сладости
/*"83260588",	// Сыр Бесплатно
"81233447",		// Сыр Бесплатно Москва
"104331145",	// Россия Пончики
"110410283"		// Москва Пончики */
];

var datasourse="d:\\Program<SP>Files\\Palemoon\\User\\Palemoon\\Profiles\\Default\\iMacros\\Datasources\\";


/*Цикл перехода по разным группам (publics)*/
for (var j=0; j<publics.length; j++)
{


var macro =  "CODE:";
var post_no = 'Запись';
var post_privat = 'Пользователь';
var count_no_post=0; //счетчик несуществующих постов

/*Чтение id из файла*/
macro +=  "CMDLINE !DATASOURCE "+publics[j]+".txt" + "\n";
macro +=  "ADD !EXTRACT {{!COL1}}" + "\n";
iimPlay(macro);
var lastpost_id=iimGetLastExtract(1); //последняя запись, её уже не проверяем
var post_id=lastpost_id;
post_id++;
/********************/
		
while (count_no_post<=30)
{	
var macro =  "CODE:";
//macro +=  "WAIT SECONDS=1" + "\n";
macro +=  "URL GOTO=http://vk.com/wall-"+publics[j]+"_";
	try { 
		macro +=post_id+ "\n";
		iimPlay(macro);
		var error_div = content.document.getElementsByClassName('body')[0].innerHTML;

		if(error_div.indexOf(post_no)!=-1)
			count_no_post++;
		
		if(error_div.indexOf(post_privat)!=-1) /*А ЕСЛИ ОПЯТЬ АДМИН ПОСТ ТО COUNT СБРОСИТЬ*/
			count_no_post=0;

	}
	catch (error)
	{ 
		//Пост существует
		count_no_post=0;
		lastpost_id=post_id; 
		//Проверка на reply в URL
		macro +=  "ADD !EXTRACT {{!URLCURRENT}}" + "\n";
		iimPlay(macro);
		var check_url=iimGetLastExtract(1);
		
		if ((check_url.indexOf('reply'))==-1) //Если не reply
		{
			//Игнор перепоста между группами из списка
			var perepost=false;

				try { 
					var error_div = content.document.getElementsByClassName('published_by_photo')[0].innerHTML;
					
					for (var xy=0; xy<publics.length; xy++){
						if(error_div.indexOf(publics[xy])!=-1)
								perepost=true;
					}
					//alert('Это перепост из смежного паблика');

				}
				catch (error)
				{
					//Проверяем тип поста
					var check_text = content.document.getElementsByClassName('wall_post_text')[0].innerHTML;
					var win_results=["забирает", "получает","vk.cc"];
					var check_month=false; //есть дата
					var check_win_results=false; //это публикация результатов

					if ((check_text.search("[ ][1-3]{0,1}[0-9][ ]января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря"))!=-1)
						check_month=true;


					if (check_month==true)
					{
						//for(var i=0; i<win_results.length; i++){
							if ((check_text.indexOf("vk.cc"))!=-1)
								check_win_results=true;
							
							/*else{ //только если есть все совпадения из массива
								check_win_results=false;
							}*/
						//}
					}

					if((check_month==true) & (check_win_results==false)){ //есть дата но нет vk.cc
						//alert('Делай репост');
						macro +=  "TAG POS=1 TYPE=A ATTR=TXT:Поделиться" + "\n";
						macro +=  "WAIT SECONDS=2" + "\n";
						macro +=  "TAG POS=1 TYPE=BUTTON ATTR=ID:like_share_send" + "\n";	
						macro +=  "WAIT SECONDS=9" + "\n";
						//iimPlay(macro);
						//А теперь вступаем во все группы из сообщения
						var club_finder = content.document.getElementsByClassName('wall_post_text')[0].innerHTML;
						var regexp=/mention_id=\"club[0-9]*\"/g;
						var current_club_id;
						var all_clubs_id=[];
						var z=0;

						while ((current_club_id=regexp.exec(club_finder))!= null)
						{
							all_clubs_id[z]=current_club_id[0];
							z++;
						}

						for (z=0; z<all_clubs_id.length; z++){
							//alert('Нужно вступить в группу!');
							all_clubs_id[z] = all_clubs_id[z].replace(/mention_id=/,"");
							all_clubs_id[z] = all_clubs_id[z].replace(/"/g,"");
							all_clubs_id[z]="http://vk.com/"+all_clubs_id[z];
							macro+="URL GOTO="+all_clubs_id[z]+ "\n";
							macro +=  "WAIT SECONDS=2" + "\n";
							macro+="SET !ERRORIGNORE YES"+ "\n";
							macro+="SET !ERRORCONTINUE YES"+ "\n";
							macro+="TAG POS=1 TYPE=BUTTON ATTR=TXT:Вступить<SP>в<SP>группу"+ "\n";
							macro+="TAG POS=1 TYPE=BUTTON ATTR=TXT:Подписаться"+ "\n";
							macro+="SET !ERRORCONTINUE NO"+ "\n";
							macro+="SET !ERRORIGNORE NO"+ "\n";
							macro +=  "WAIT SECONDS=2" + "\n";
							macro+="BACK"+ "\n";
							
						}
						iimPlay(macro);
					}
				}
		}
	} 
	finally{
		post_id++;
	}
}

//запись в файл lastpost_id
/*****************Функции удалить/записать***************/
function delete_file(){
var macro;
macro = "CODE:";	
macro += "FILEDELETE NAME="+datasourse+publics[j]+".txt"+"\n";
iimPlay(macro);
}

function write_to_file(last_post){
var macro;
iimSet("SOHRANYAEM",last_post);
macro = "CODE:";
macro += "ADD !EXTRACT {{SOHRANYAEM}}"+"\n";
macro += "SAVEAS TYPE=EXTRACT FOLDER="+datasourse+" FILE="+publics[j]+".txt"+ "\n";
iimPlay(macro);
}
/**********************************************************/
delete_file();
write_to_file(lastpost_id);

}/*Цикл перехода по разным группам (publics)*/