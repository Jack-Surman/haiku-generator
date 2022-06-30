const haikuInputContainers: NodeListOf<HTMLDivElement> = document.querySelectorAll('.haiku__input-container');

// this is the function to determine how many syllables the function arguments has
const syllableChecker = (word: string) => {
    word = word.toLowerCase(); // ensures word is standardised

    const areAllLettersTheSame: boolean = /^(.)\1+$/.test(word) // this is a boolean value that represents whether all the characters are unique
    // admittedly it's a rare use case, but I want to cover every eventuality
    if (areAllLettersTheSame || word.length === 0) {
        // if all the letters are the same or there are no letters (a space) then it will return 0 syllables
        return 0;
    } else if (word.length === 1 || word.length === 2) { // ensures that 1 syllable is returned for 1 or 2-letter words
        return 1;
    }

    const vowels: string[] = ['a', 'e', 'i', 'o', 'u'] // array of vowels
    const vowelsWithY: string[] = [...vowels, 'y'] // array of vowels + y
    const threeLetterTwoSyllableWords: string[] = ['aba', 'abo', 'ada', 'ado', 'aga', 'ago', 'ala', 'ali', 'ama', 'ana',
        'ane', 'ani', 'ano', 'anu', 'ape', 'ara', 'ata', 'ave', 'azo', 'cia', 'dia', 'eda', 'ego', 'ela', 'epi', 'era',
        'eta', 'gia', 'ida', 'ido', 'iga', 'ilo', 'imo', 'ion', 'ipa', 'ira', 'ita', 'iva', 'obi', 'ola', 'oni', 'ono',
        'oso', 'oto', 'pia', 'rio', 'usa', 'uzi', 'via'];

    const threeLetterTwoSyllableWordsPlurals: string[] = threeLetterTwoSyllableWords.map(arrayWord => arrayWord + 's'); // plurals of the words above

    const firstChar = word.charAt(0); // first letter in the word the user entered
    const isFirstCharVowelOrY = vowelsWithY.indexOf(firstChar) > -1; // returns true or false if the first letter is a vowel or 'y'

    const lastChar = word.slice(-1); // last letter in the word the user entered
    const isLastCharVowelOrY = vowelsWithY.indexOf(lastChar) > -1; // returns true or false if the last letter is a vowel or 'y's

    if (word.length === 3 || word.length === 4) {
        const secondChar = word.charAt(1); // second letter in the word the user entered
        const isSecondCharVowelOrY = vowelsWithY.indexOf(secondChar) > -1; // returns true or false if the second letter is a vowel or 'y'

        if (word.length === 3) {
            if (isFirstCharVowelOrY && isSecondCharVowelOrY && isLastCharVowelOrY) {
                return 1; // if all 3 letters are vowel sounds e.g. 'eye' or 'you' it returns 1 syllable
            } else if (threeLetterTwoSyllableWords.indexOf(word) > -1) {
                return 2;
            }
        } else if (word.length === 4 && threeLetterTwoSyllableWordsPlurals.indexOf(word) > -1) {
            return 2;
        }
    }

    // if the word is longer than 3 letters or the special 4 letter words
    // the following lines are the regex responsible for determining how many syllables a word has
    word = word.replace(/(?:[^laeiouy]|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');

    // this will return the final value of the user's input has passed the special use cases
    const numberOfSyllables = word.match(/[aeiouy]{1,2}/g);
    if (numberOfSyllables) {
        return numberOfSyllables.length;
    }

}

const createHaikuOutput = () => {
    const createOutputBtn = document.querySelector('.haiku__create-btn') as HTMLElement; // create Haiku button
    const haikuOutputArea = document.querySelector('.haiku__output-container') as HTMLDivElement; // are where the generated Haiku will be shown

    if (!createOutputBtn.getAttribute('disabled')) { // if the button isn't disabled, it adds a click listener to the button
        createOutputBtn.addEventListener('click', () => {
            haikuOutputArea.dataset.active = 'true'; // this show the Haiku preview area if the use clicks the button

            const inputFields: NodeListOf<HTMLInputElement> = document.querySelectorAll('.haiku__input'); // this is a nodelist of the input areas
            const outputFields: NodeListOf<HTMLElement> = haikuOutputArea.querySelectorAll('.haiku__output'); // this is a nodelist of the output areas

            inputFields.forEach((inputField, inputFieldIndex) => {
                outputFields[inputFieldIndex].innerText = inputFields[inputFieldIndex].value; // this ensures that the relevant line is outputted into the correct area.
            });
        });
    }
}

const isHaikuValid = () => {
    const validInputFields: HTMLInputElement[] = [];
    const createOutputBtn = document.querySelector('.haiku__create-btn') as HTMLElement;
    const haikuOutputArea = document.querySelector('.haiku__output-container') as HTMLDivElement;

    haikuInputContainers.forEach(haikuInputContainer => {
        const haikuInputField = haikuInputContainer.querySelector('.haiku__input') as HTMLInputElement;
        haikuInputField.dataset.valid === 'true' ? validInputFields.push(haikuInputField) : '';
    });

    if (validInputFields.length === haikuInputContainers.length) {
        createOutputBtn.removeAttribute('disabled');
    } else {
        createOutputBtn.setAttribute('disabled', 'disabled');
        haikuOutputArea.dataset.active = 'false';

        const haikuOutputAreaHTML: NodeListOf<HTMLElement> = haikuOutputArea.querySelectorAll('.haiku__output');
        haikuOutputAreaHTML.forEach(haikuOutputSpan => haikuOutputSpan.innerText = '');
    }
}

const haikuInputListeners = () => {
    haikuInputContainers.forEach(haikuInputContainer => {
        const inputField = haikuInputContainer.querySelector('.haiku__input') as HTMLInputElement;
        const outputArea = haikuInputContainer.querySelector('.haiku__syllables-output') as HTMLSpanElement;

        inputField.addEventListener('input', () => {
            if (inputField.value) {
                const userInput: string = inputField.value;
                const userInputWords: string[] = userInput.split(" ");
                const userInputSyllables: number[] = []

                userInputWords.forEach(word => {
                    userInputSyllables.push(+(String(syllableChecker(word))));
                });

                const userInputSyllablesSum: number = userInputSyllables.reduce((a, b) => a + b, 0);
                const lineRequiredSyllables: number = +(String(inputField.dataset.requiredSyllables));
                const remainingSyllables: number = lineRequiredSyllables - userInputSyllablesSum;

                if (userInputSyllablesSum === 0) {
                    inputField.dataset.valid = 'false';
                    outputArea.innerText = ``;
                    isHaikuValid();
                } else if (remainingSyllables === 0) {
                    inputField.dataset.valid = 'true';
                    outputArea.innerText = 'You\'ve got the correct number of syllables for this line';
                    isHaikuValid();
                } else if (remainingSyllables < 0) {
                    inputField.dataset.valid = 'false';
                    outputArea.innerText = `You've got ${Math.abs(remainingSyllables)} too many syllables for this line`;
                    isHaikuValid();
                } else if (remainingSyllables > 0) {
                    inputField.dataset.valid = 'false';
                    outputArea.innerText = `You've got ${remainingSyllables} too few syllables for this line`;
                    isHaikuValid();
                }
            } else {
                inputField.dataset.valid = 'false';
                outputArea.innerText = ``
                isHaikuValid();
            }
        });
        createHaikuOutput();
    });
}

haikuInputListeners();

// host on AWS
// how to get banner ads