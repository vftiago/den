export const copyToCliboard = (text: string) => {
	const temporaryInput = document.createElement("input");
	document.body.appendChild(temporaryInput);
	temporaryInput.value = text;
	temporaryInput.select();
	document.execCommand("copy");
	document.body.removeChild(temporaryInput);
};
