/*

v. 0.1.0

*/

const isDevelopmentMode = process.env.NODE_ENV === "dev"
const isProductionMode = !isDevelopmentMode

// ----------------- C O N T R O L   P A N E L ---------------

let ControlPanelConfig = {

	// |------------ НАСТРОЙКА РАЗРАБОТКИ ---------|
	//
	// ОСНОВНОЙ каталог исходных файлов проекта где храняться все точки входа
	globInputPath: 'src',

  // СПИСОК HTML СТРАНИЦ (точек входа - в одну точку входит обязательно js файл и pug файл).
  // Синтаксис настройки: [ ['имя_входной_точки'], ['относительный_путь_к_входным_файлам'] ]
  // Указывается ТОЛЬКО КАТАЛОГ (относительно globInputPath) в котором должны находиться index.pug и index.js конкретной страницы.
	/* ПРИМЕР :
	[ ['home'], ['colors'] ],
	[ ['home'], ['colors/about'] ],
	*/
	// !!! В данной папке должен лежать файл index.pug и index.js. index.pug и index.js будут переименованы в имя точки. В готовый [имя_точки].html будут автоматически импортированы [имя_точки].js и [имя_точки].css
  entryPointsPath: [
    // [ ['home'], ['colors'] ],
    //[ ['about'], ['block'] ],
    
  ],

  // ИМЯ ТОЧКИ для dev-server`а в режиме разработки. По умолчанию запускается первая в списке точка.
  entryPointsDevelopment: '',

  // Альясы. Переменные для путей. АБСОЛЮТНЫЙ путь задается автоматически! Нужно указать ОТНОСИТЕЛЬНЫЙ путь (относительно файла webpack.config.js =) ).
	// Используется для понятной записи в import вместо "./../../../" пишется @вашаПеременная 
	/* примеры записей:
			'@myMenu': 'src/project/myBlock1/menu', 
			'@paginationBlock': 'src/project2/myBlock/pagination'
	*/
	alias: {
      
	},
	
	// Опция позволяет выделять скрипты которые подключаются на нескольких страницах в отдельный файл js.
	// если true - выделять в отдельный файл, если false - не выделять, все упаковывать в один файл js.
	chunks : true,
	
  developmentServer: {
    
    // Порт сервера на котором будет автоматически запускаться сервер. Можно оставить по умолчанию. 
    port: 8080,
    
    open: true, // автоматически запустить страницу разработки в браузере по умолчанию
    // index: 'about.html',
    overlay: {

      // Отображение ПРЕДУПРЕЖДЕНИЙ js кода на странице.
      // true - отображать, false - игнорировать
      warnings: false,
      
      // Отображение ОШИБОК js кода на странице.
      // true - отображать, false - игнорировать
      errors: true
    },
  },
  
	// |------------ НАСТРОЙКА СБОРКИ ГОТОВЫХ ФАЙЛОВ ---------|
	//
	// ОСНОВНОЙ каталог куда будут экспортироваться все обработанные файлы (html, css, js) проекта
	exitPointsPath: 'dist',

	// ОСНОВНОЙ каталог куда будут экспортироваться файлы JS (относительно exitPointsPath)
  exitPointsJs: 'js',
  
  // ОСНОВНОЙ каталог куда будут экспортироваться файлы CSS (относительно exitPointsPath)
	exitPointsCss: 'css',

  // СПИСОК каталогов/файлов ДЛЯ КОПИРОВАНИЯ из исходников в итоговую сборку. Например картинки и шрифты
  // синтаксис:
  /* 
  [ ['откуда_путь___относительно_globInputPath'], ['куда_путь___относительно_exitPointsPath'] ],
  [ ['еще_откуда_путь___относительно_globInputPath'], ['еще_куда_путь___относительно_exitPointsPath'] ]
  */
  // пример:
  /*
  [ ['home/block/img'], ['img'] ],
  [ ['home/block/fonts'], ['fonts'] ],
  */
  copyListData: [
    
  ]
}

// ----------------- C O N T R O L   P A N E L   E N D ---------------


// -------- обработка ControlPanelConfig -------
const optimizeProductionMode = () => {
	let config
	if (ControlPanelConfig.chunks){
		config = {
			splitChunks: {
				automaticNameDelimiter: '_',
				chunks: 'all'
			}
		}
	}
	if (isProductionMode) {
		config.minimizer = [
			new OptimizeCssAssetsPlugin(),
			new TerserWebpackPlugin()
		]
	}
	return config
}

const aliasConfig = () => {
  for (key in ControlPanelConfig.alias) {
    ControlPanelConfig.alias[key]=path.resolve(__dirname,`${ControlPanelConfig.globInputPath}/${ControlPanelConfig.alias[key]}`)
  }
  return ControlPanelConfig.alias
}

const developmentConfiguration = () => {
  let config = {}
  if(isDevelopmentMode)
    config = ControlPanelConfig.developmentServer
  if(ControlPanelConfig.entryPointsDevelopment)
    config.index=`${ControlPanelConfig.entryPointsDevelopment}.html`
      else config.index=`${ControlPanelConfig.entryPointsPath[0][0]}.html`
  return config
}

const entryPointsPath = (pluginsPath) => {
  let config
  if(!pluginsPath){
    config={}
    for(let i=0; i<ControlPanelConfig.entryPointsPath.length; i++) {
      config[ControlPanelConfig.entryPointsPath[i][0]]=`./${ControlPanelConfig.entryPointsPath[i][1]}/index`
    }
  }
  if(pluginsPath){
    config=[]
    for(let i=0; i<ControlPanelConfig.entryPointsPath.length; i++) {
      config[i] = new HTMLWebpackPlugin({ 
        filename: `${ControlPanelConfig.entryPointsPath[i][0]}.html`,
        template: path.resolve(__dirname, `${ControlPanelConfig.globInputPath}/${ControlPanelConfig.entryPointsPath[i][1]}/index.pug`),
        chunks: [ControlPanelConfig.entryPointsPath[i][0][0]],
        minify: {
          collapseWhitespace: isProductionMode
        },
      })
    }
    config.push(new CleanWebpackPlugin())
    let arrayListCopy=[]
    for(let i=0;i<ControlPanelConfig.copyListData.length;i++){
      arrayListCopy[i]={
        from: path.resolve(__dirname, `${ControlPanelConfig.globInputPath}/${ControlPanelConfig.copyListData[i][0]}`), to: path.resolve(__dirname, `${ControlPanelConfig.exitPointsPath}/${ControlPanelConfig.copyListData[i][1]}`)
      }
    }
    config.push(new CopyWebpackPlugin(arrayListCopy))
    config.push(new MiniCssExtractPlugin({filename: `${ControlPanelConfig.exitPointsCss}/[name].css`}))
  }  
    return config
}

// ---------------------------------------------

const path = require('path') // модуль предоставляет утилиты для работы с путями к файлам и директориям
//const webpack = require('webpack') // модуль самого вебпака
const HTMLWebpackPlugin = require('html-webpack-plugin') // Автоматически прописывает в выходной HTML файл все зависимости (связки) в точки входа. 
const CopyWebpackPlugin = require('copy-webpack-plugin') // плагин позволяет копировать отдельные уже существующие файлы и\или каталоги в итоговую сборку. 
const MiniCssExtractPlugin = require('mini-css-extract-plugin') // плагин извлекает CSS в отдельный файл(ы)
const {CleanWebpackPlugin} = require('clean-webpack-plugin') // плагин удаляет файлы предыдущей(их) сборки из (output) каталога после новой сборки. Таким образом в папках (output) сборки будут только новые файлы. !!Включается только при включенном HASH = true.
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin') // плагин используется для минимизации выходного (output) css файла.
const TerserWebpackPlugin = require('terser-webpack-plugin') // плагин используется для минимизации выходного (output) JavaScript файла.

module.exports = {
	context: path.resolve(__dirname, ControlPanelConfig.globInputPath),
	entry: entryPointsPath(false),
	output: {
		filename: `./${ControlPanelConfig.exitPointsJs}/[name].js`,
		path: path.resolve(__dirname,ControlPanelConfig.exitPointsPath)
	},
	devtool: "source-map",
	resolve: {
		extensions: ['.js', '.json', '.png', '.jpg', '.css', '.scss','.sass','.pug'],
    alias: aliasConfig(),
	},
  optimization: optimizeProductionMode(),
  devServer: developmentConfiguration(),
   plugins: entryPointsPath(true),
	module: {
		rules: [
			{
				test: /\.(png|jpg|svg|gif)$/,
				loader: 'file-loader',
				options: {
					name: '[name].[ext]'
				}
			},
			{
				test: /\.(ttf|woff|woff2|eot|svg)$/,
				loader: 'file-loader',
				options: {
					name: '[name].[ext]',
				}
			},
			{
				test: /\.s[a|c]ss$/,
				use: [MiniCssExtractPlugin.loader,'css-loader','sass-loader']
     		},
      {
				test: /\.pug$/,
				use:['pug-loader']
			}
		]
	},
	
}

// ---- обработка ControlPanelConfig --
if(isProductionMode) module.exports.devtool=false

