interface InputObject {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

export const convertObject = (inputObj: InputObject): InputObject => {
    return Object.entries(inputObj).reduce((result, [key, value]) => {
        if(Array.isArray(value) && value.length > 0) {
            result[key] = value.join(",");
        } else if (value === null || value === undefined) {
            result[key] = "";
        } else {
            result[key] = value;
        }
        return result;
    }, {} as InputObject);
};