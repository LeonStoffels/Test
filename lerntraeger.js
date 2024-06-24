const API_URL = "https://thowllerntrager-sandbox.mxapps.io/rest/lerntraeger/v1/lerntraeger/";

// Check if given value is null or undefined
function isNil(value) {
    return value === null || value === undefined;
}

// Check if given value is byte (between 0 and 255)
function isByte(value) {
    return value >= 0 && value <= 255;
}

// Check if given value is boolean (true or false)
function isBoolean(value) {
    return typeof value === "boolean" || value === "true" ||value === "false";
}

// Check if given RGB string is valid
function isValidRGBString(RGBString) {
    // Regular expression for a RGB string in the shape of rgb(255,255,255)
    const regex = /^rgb\((\d{1,2}|1\d\d|2[0-4]\d|25[0-5]),(\d{1,2}|1\d\d|2[0-4]\d|25[0-5]),(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\)$/;

    return regex.test(RGBString);
}

// Convert RGB string to array of bytes
function extractRGBBytes(RGBString) {
    if (isValidRGBString(RGBString)) {
        // Remove the "rgb(" and ")" parts of the string and split the rest at the commas
        let rgbParts = RGBString.replace(/rgb\(|\)/g, "").split(",");

        // Convert each part to a number and return it in as an array
        return rgbParts.map(Number);
    }

    // If the string does not match the expected format, return an error
    throw new Error("Invalid RGB string format");
}

class Lerntraeger {
    // Define default values
    static DEFAULT_COLOR_VALUE = "rgb(255,255,255)";
    static DEFAULT_BRIGHTNESS = 0;
    static DEFAULT_DRIVE_FORWARD = false;
    static DEFAULT_DRIVE_BACKWARD = false;
    static DEFAULT_FLIGHT_MODE = false;

    constructor(name) {
        // Set student name from parameter
        this.name = name;
        
        // Set default values
        this.setColorValueWithString(Lerntraeger.DEFAULT_COLOR_VALUE);
        this.setBrightness(Lerntraeger.DEFAULT_BRIGHTNESS);
        this.setDriveForward(Lerntraeger.DEFAULT_DRIVE_FORWARD);
        this.setDriveBackward(Lerntraeger.DEFAULT_DRIVE_BACKWARD);
        this.setFlightMode(Lerntraeger.DEFAULT_FLIGHT_MODE);

        // Update local object with values of online model
        this.get_all();
    }

    // Get current values from online model and apply them to the local object
    async get_all() {
        // Build complete API URL
        const url = API_URL + this.name + "%20Lerntr%C3%A4ger";

        // Send GET request
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Accept": "application/json",
            }
        });

        // Wait for response
        const data = await response.json();

        // Apply values to local object
        this.setColorValueWithString(data.colorValue);
        this.setBrightness(data.brightness);
        this.setDriveForward(data.driveForward);
        this.setDriveBackward(data.driveBackward);
        this.setFlightMode(data.flightMode);
    }

    // Apply current values of local object to online model
    async patch(body) {
        // Build complete API URL
        const url = API_URL + this.name + "%20Lerntr%C3%A4ger";

        // Send PATCH request
        const response = await fetch(url, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body), // Convert JSON to string before sending
        });
        
        // Check response code and log error to console
        if (response.status > 400) {
            console.error("Error applying data: ", JSON.stringify(body));
            console.error(response.statusText);
            console.error(await response.text());
        }
    }

    // Apply all current values of local object to online model
    async patch_all() {
        // Build complete API URL
        const url = API_URL + this.name + "%20Lerntr%C3%A4ger";

        // Build request body with local object values (JSON)
        const body = {
            "Name": `${this.name} Lernträger`,
            "colorValue": this.colorValue,
            "brightness": this.brightness,
            "transX": 0,
            "transY": 0,
            "transZ": 0,
            "DriveForward": this.driveForward,
            "DriveBackward": this.driveBackward,
            "FlightMode": this.flightMode
        };

        // Send PATCH request
        const response = await fetch(url, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body), // Convert JSON to string before sending
        });
        
        // Check response code and log error to console
        if (response.status > 400) {
            console.error("Error applying data: ", JSON.stringify(body));
            console.error(response.statusText);
            console.error(await response.text());
        }
    }

    setColor(r, g, b) {
        // Do nothing if a value is null or undefined
        if (isNil(r) || isNil(g) || isNil(b)) return; 
        
        // Show error if a value is not a byte
        if (!isByte(r) || !isByte(g) || !isByte(b)) throw new Error("Value is not a byte (between 0 and 255)");

        // Get local RGB values for backup
        let rgb = extractRGBBytes(this.colorValue);

        // Apply RGB value to local object, use local values if empty
        this.colorValue = `rgb(${r == "" ? rgb[0] : r},${g == "" ? rgb[1] : g},${b == "" ? rgb[2] : b})`;

        // Build request body with local object values (JSON)
        const body = {
            "Name": `${this.name} Lernträger`,
            "colorValue": this.colorValue,
        };
        this.patch(body);
    }

    setColorValueWithString(value) {
        // Do nothing if value is null or undefined
        if (isNil(value)) return; 
        
        // Show error if a value is not a byte
        if (!isValidRGBString(value)) throw new Error("Value is not a valid RGB string");

        // Apply RGB value to local object
        this.colorValue = value;
    }

    setBrightness(value) {
        // Do nothing if value is null or undefined
        if (isNil(value)) return; 

        // Show error if value is not between 0 and 100
        if (value < 0 || value > 100) throw new Error("Value is not a valid brightness (between 0 and 100)");

        // Apply brightness value to local object
        this.brightness = value;
        // Build request body with local object values (JSON)
        const body = {
            "Name": `${this.name} Lernträger`,
            "brightness": this.brightness,
        };

        this.patch(body);
    }

    setDriveForward(value) {

        // Do nothing if value is null or undefined
        if (isNil(value)) return; 

        // Show error if value is not a boolean
        if(!isBoolean(value)) throw new Error("Value is not a boolean (true or false)");
        
        // Apply driveForward value to local object
        this.driveForward = value;

        // Build request body with local object values (JSON)
        const body = {
            "Name": `${this.name} Lernträger`,
            "DriveForward": this.driveForward,
        };
        this.patch(body);
    }

    setDriveBackward(value) {
        // Do nothing if value is null or undefined
        if (isNil(value)) return; 

        // Show error if value is not a boolean
        if(!isBoolean(value)) throw new Error("Value is not a boolean (true or false)");
        
        // Apply driveBackward value to local object
        this.driveBackward = value;
         // Build request body with local object values (JSON)
         const body = {
            "Name": `${this.name} Lernträger`,
            "DriveBackward": this.driveBackward,
        };
        this.patch(body);
    }

    setFlightMode(value) {
        // Do nothing if value is null or undefined
        if (isNil(value)) return;

        // Show error if value is not a boolean
        if(!isBoolean(value)) throw new Error("Value is not a boolean (true or false)");
        
        // Apply flightMode value to local object
        this.flightMode = value;
        // Build request body with local object values (JSON)
        const body = {
            "Name": `${this.name} Lernträger`,
            "FlightMode": this.flightMode
        };
        this.patch(body);

    }
}
