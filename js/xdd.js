const imageFile = document.getElementsByName('picture')[0];
const preview = document.getElementById('preview');
const canvas = preview.getContext('2d');
const asciiImage = document.getElementById('ascii');
const buttonContrast = document.querySelector('button#contrast');
const buttonExport = document.querySelector('button#export');
let width = 40;
let height = 40;
const loadedimg = new Image(width, height);
imageFile.onchange = (e) => {
    const fileReader = new FileReader();
    let file = e.currentTarget.files[0];
    if (!file.type.includes('image')) {
        return alert('Only images are allowed!');
    }
    fileReader.readAsDataURL(file);
    fileReader.onload = (fileReaderEvent) => {
        loadedimg.src = fileReaderEvent.target.result;
        loadedimg.onload = () => {
            preview.width = width;
            preview.height = height;
            canvas.filter = 'grayscale(1)';
            canvas.drawImage(loadedimg, 0, 0, width, height);
        };
    };
};
buttonContrast.onclick = (e) => {
    console.log(e);
    let contrasted = contrastImage(canvas.getImageData(0, 0, width, height), -50);
    console.log(contrasted);
    canvas.putImageData(contrasted, 0, 0);
};
buttonExport.onclick = () => { exportToAscii(); };
function contrastImage(imgData, contrast) {
    var d = imgData.data;
    console.log(imgData);
    contrast = (contrast / 100) + 1; //convert to decimal & shift range: [0..2]
    var intercept = 128 * (1 - contrast);
    for (var i = 0; i < d.length; i += 4) { //r,g,b,a
        d[i] = d[i] * contrast + intercept;
        d[i + 1] = d[i + 1] * contrast + intercept;
        d[i + 2] = d[i + 2] * contrast + intercept;
    }
    return imgData;
}
function exportToAscii() {
    let imgData = canvas.getImageData(0, 0, width, height);
    let d = imgData.data;
    let lightnessMap = new Array;
    for (var i = 0; i < d.length; i += 4) { //r,g,b,a
        lightnessMap.push(d[i]);
    }
    console.log(lightnessMap);
    drawAscii(lightnessMap, width);
}
const grayRamp = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,"^`\'. ';
const brailleRamp = ['⠀', '⠮', '⠐', '⠼', '⠫', '⠩', '⠯', '⠄', '⠷', '⠾', '⠡', '⠬', '⠠', '⠤', '⠨', '⠌', '⠴', '⠂', '⠆', '⠒', '⠲', '⠢',
    '⠖', '⠶', '⠦', '⠔', '⠱', '⠰', '⠣', '⠿', '⠜', '⠹', '⠈', '⠁', '⠃', '⠉', '⠙', '⠑', '⠋', '⠛', '⠓', '⠊', '⠚', '⠅',
    '⠇', '⠍', '⠝', '⠕', '⠏', '⠟', '⠗', '⠎', '⠞', '⠥', '⠧', '⠺', '⠭', '⠽', '⠵', '⠪', '⠳', '⠻', '⠘', '⠸'];
const getCharacterForGrayScale = (grayScale, ramp) => ramp[Math.ceil((ramp.length - 1) * grayScale / 255)];
const drawAscii = (grayScales, width, isReversed) => {
    const ascii = grayScales.reduce((asciiImage, grayScale, index) => {
        // let nextChars = getCharacterForGrayScale(grayScale, grayRamp);
        let nextChars = getCharacterForGrayScale(grayScale, brailleRamp);
        if ((index + 1) % width === 0) {
            nextChars += '\n';
        }
        return asciiImage + nextChars;
    }, '');
    asciiImage.textContent = ascii;
};
