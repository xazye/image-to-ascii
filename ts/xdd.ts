const imageFile = document.getElementsByName('picture')[0];
const charSetSelect = document.getElementById('char-set') as HTMLSelectElement;

const preview = document.getElementById('preview') as HTMLCanvasElement;
const canvas = preview.getContext('2d') as CanvasRenderingContext2D;

const previewWithFilters = document.getElementById('previewWithFilters') as HTMLCanvasElement;
const canvasWithFilters = previewWithFilters.getContext('2d') as CanvasRenderingContext2D;

const maxWidthInput = document.getElementById('max-width') as HTMLInputElement;
const maxHeightInput = document.getElementById('max-height') as HTMLInputElement;

const asciiImage = document.getElementById('ascii');

const contrastInput = document.getElementById('contrast') as HTMLInputElement;
const contrastValue = document.getElementById('contrast-value') as HTMLSpanElement;

const buttonExport = document.querySelector('button#export') as HTMLButtonElement;

const posterzieInput = document.querySelector('input#posterize') as HTMLInputElement;
const posterizeValue = document.querySelector('#posterize-value') as HTMLSpanElement;
let width = 40;
let height = 40;


const ASCII_CHARS = ['@', '#', 'S', '%', '?', '*', '+', ';', ':', ',', '.'];
const PRINTABLE_CHARS = ["$", "@", "B", "%", "8", "&", "W", "M", "#", "*", "o", "a", "h", "k", "b", "d", "p", "q", "w", "m", "Z", "O", "0", "Q", "L", "C", "J", "U", "Y", "X", "z", "c", "v", "u", "n", "x", "r", "j", "f", "t", "/", "|", "(", ")", "1", "{", "}", "[", "]", "?", "-", "_", "+", "~", "<", ">", "i", "!", "l", "I", ";", ":", ",", "\"", "^", "`", "'", ".", " "];
const BRAILE_CHARS = [ "⠿", "⠾", "⠽", "⠼", "⠻", "⠺", "⠹", "⠸", "⠷", "⠶", "⠵", "⠴", "⠳", "⠲", "⠱", "⠰", "⠯", "⠮", "⠭", "⠬", "⠫", "⠪", "⠩", "⠨", "⠧", "⠦", "⠥", "⠤", "⠣", "⠢", "⠡", "⠠", "⠟", "⠞", "⠝", "⠜", "⠛", "⠚", "⠙", "⠘", "⠗", "⠖", "⠕", "⠔", "⠓", "⠒", "⠑", "⠐", "⠏", "⠎", "⠍", "⠌", "⠋", "⠊", "⠉", "⠈", "⠇", "⠆", "⠅", "⠄", "⠃", "⠂", "⠁", "⠀"]

const loadedimg = new Image();

function getSelectedCharSet(): string[] {
    switch (charSetSelect.value) {
        case 'basic':
            return ASCII_CHARS;
        case 'printable':
            return PRINTABLE_CHARS;
        case 'bas':
            return BRAILE_CHARS;
        default:
            return BRAILE_CHARS;
    }
}


contrastInput.addEventListener('input', () => {
	contrastValue.textContent = `${contrastInput.value}%`;
	setTimeout(() => {
		applyFilters();
	}, 100);
});
posterzieInput.addEventListener('input',() =>{
	console.log(posterizeValue,posterzieInput)
	posterizeValue.textContent = `${posterzieInput.value}`
	setTimeout(() => {
		applyFilters();
	},100);
})
imageFile.onchange = (e: Event) => {
	const fileReader = new FileReader();
	let file = (<HTMLInputElement>e.currentTarget).files[0];
	if (!file.type.includes('image')) {
		return alert('Only images are allowed!');
	}

	fileReader.readAsDataURL(file);
	fileReader.onload = (fileReaderEvent) => {
		loadedimg.src = fileReaderEvent.target.result as string;
		loadedimg.onload = () => {
			preview.width = 200;
			preview.height = 200;

			// const contrast = parseInt(contrastInput.value) / 100;
			previewWithFilters.width = 200;
			previewWithFilters.height = 200;
			canvasWithFilters.filter = 'grayscale(1)';


			canvas.drawImage(loadedimg, 0, 0, 200, 200);
			canvasWithFilters.drawImage(loadedimg, 0, 0, 200, 200);
		}
	}
}


buttonExport.onclick = () => { exportToAscii() };

function contrastImage(rendContext, contrast: number): ImageData {  //input range [-100..100]
	let xdd = rendContext.getImageData(0, 0, 200, 200);
	let d = xdd.data;
	contrast = (contrast / 100);  //convert to decimal & shift range: [0..2]
	// debugger
	let intercept = 128 * (1 - contrast);
	for (let i = 0; i < d.length; i += 4) {   //r,g,b,a
		d[i] = d[i] * contrast + intercept;
		d[i + 1] = d[i + 1] * contrast + intercept;
		d[i + 2] = d[i + 2] * contrast + intercept;
	}
	return xdd;
}

function exportToAscii() {
	const aspectRatio = loadedimg.width / loadedimg.height;
	const maxWidth = parseInt(maxWidthInput.value);
	const maxHeight = parseInt(maxHeightInput.value);
	console.log('ascpet', aspectRatio);

	let width = maxWidth;
	let height = Math.round(width / aspectRatio);

	if (height > maxHeight) {
		height = maxHeight;
		width = Math.round(height * aspectRatio);
	}
	const tempCanvas = new OffscreenCanvas(width, height);
	const tempCtx = tempCanvas.getContext("2d");
	tempCtx.drawImage(previewWithFilters, 0, 0, width, height);

	let preparedImageDAta = new Array;
	let tempCanvasData = tempCtx.getImageData(0, 0, width, height).data;
	for (var i = 0; i < tempCanvasData.length; i += 4) {   //r,g,b,a
		preparedImageDAta.push(tempCanvasData[i]);
	}
	const charSet = getSelectedCharSet();
	drawAscii(preparedImageDAta, width, charSet);
}



const getCharacterForGrayScale = (grayScale, ramp) => ramp[Math.ceil((ramp.length - 1) * grayScale / 255)];

const drawAscii = (grayScales, width,charSet) => {
	asciiImage.textContent = '';
	const ascii = grayScales.reduce((asciiImage, grayScale, index) => {
		let nextChars = getCharacterForGrayScale(grayScale, charSet);
		if ((index + 1) % width === 0) {
			nextChars += '\n';
		}

		return asciiImage + nextChars;
	}, '');

	asciiImage.textContent = ascii;
};
const tempCanvas = new OffscreenCanvas(200, 200);
	
const tempCtx = tempCanvas.getContext("2d", {willReadFrequently: true});

const applyFilters = () =>{
	const contrast = parseInt(contrastInput.value);
	
	tempCtx.drawImage(preview, 0, 0, 200, 200);
	let modifed = contrastImage(tempCtx, contrast);
	modifed = posterize(modifed,[posterzieInput.value,posterzieInput.value,posterzieInput.value]);
	
	tempCtx.putImageData(modifed,0,0);
	// tempCtx.filter = 'grayscale(1)';
	
	// console.log(tempCtx);
	// console.log(contrastImage(tempCtx, contrast));
	
	canvasWithFilters.putImageData(tempCtx.getImageData(0,0,200,200), 0, 0,);
	canvasWithFilters.filter = 'grayscale(1)';
}

const posterize = (rendContext, value) : ImageData =>{
	console.log(rendContext);
	let d = rendContext.data;
	for (var i = 0; i < d.length; i += 4) {   //r,g,b,a
		d[i] =     (value[0] === 0 ? 0 : Math.floor(Math.floor(d[i]/255*value[0]) * 255/value[0]));
		d[i + 1] = (value[1] === 0 ? 0 : Math.floor(Math.floor(d[i + 1]/255*value[1]) * 255/value[1]));
		d[i + 2] = (value[2] === 0 ? 0 : Math.floor(Math.floor(d[i + 2]/255*value[2]) * 255/value[2]));
	}
	return rendContext
}