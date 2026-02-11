
import uploadOnCloudinary from "../config/cloudinary.js";
import geminiResponse from "../gemini.js";
import User from "../models/user.model.js";
import moment from 'moment';

const fallbackAssistantResponse = (command = "", geminiFailureMessage = "Gemini is unavailable right now.") => {
    const text = command.trim();
    const lower = text.toLowerCase();

    if (!text) {
        return {
            type: "general",
            userInput: "",
            response: "Please say something so I can help."
        };
    }

    if (lower.includes("time")) {
        return { type: "get_time", userInput: text };
    }

    if (lower.includes("date")) {
        return { type: "get_date", userInput: text };
    }

    if (lower.includes("day")) {
        return { type: "get_day", userInput: text };
    }

    if (lower.includes("month")) {
        return { type: "get_month", userInput: text };
    }

    if (lower.includes("open calculator") || lower === "calculator") {
        return {
            type: "calculator_open",
            userInput: text,
            response: "Opening calculator."
        };
    }

    if (lower.includes("instagram")) {
        return {
            type: "instagram_open",
            userInput: text,
            response: "Opening Instagram."
        };
    }

    if (lower.includes("facebook")) {
        return {
            type: "facebook_open",
            userInput: text,
            response: "Opening Facebook."
        };
    }

    if (lower.startsWith("play ") || lower.includes("play on youtube")) {
        const cleaned = text.replace(/^play\s+/i, "").replace(/\s+on youtube$/i, "").trim();
        return {
            type: "youtube_play",
            userInput: cleaned || text,
            response: "Playing it on YouTube."
        };
    }

    if (lower.includes("youtube")) {
        const cleaned = text
            .replace(/search/i, "")
            .replace(/on youtube/i, "")
            .replace(/youtube/i, "")
            .trim();
        return {
            type: "youtube_search",
            userInput: cleaned || text,
            response: "Searching on YouTube."
        };
    }

    if (lower.includes("google") || lower.startsWith("search ")) {
        const cleaned = text
            .replace(/search/i, "")
            .replace(/on google/i, "")
            .replace(/google/i, "")
            .trim();
        return {
            type: "google_search",
            userInput: cleaned || text,
            response: "Searching on Google."
        };
    }

    if (lower.includes("weather")) {
        return {
            type: "weather-show",
            userInput: text,
            response: `${geminiFailureMessage} Please check your weather app for live weather updates.`
        };
    }

    return {
        type: "general",
        userInput: text,
        response: `${geminiFailureMessage} I can still help with time, date, day, month, Google, YouTube, Instagram, Facebook, and calculator commands.`
    };
};




export const getCurrentUser = async(req, res) => {
    
    try {
        const userId = req.userId;
        const user = await User.findById(userId).select('-password');
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        return res.status(200).json(user);
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "get current user error"});
    }
}

export const updateAssistant = async (req, res) => {

    try {
         const { assistantName, imageUrl} = req.body;
         let assistantImage;

         if(req.file){
            assistantImage = await uploadOnCloudinary(req.file.path);
         } else {
            assistantImage = imageUrl;
         }

         const user = await User.findByIdAndUpdate(req.userId, {
            assistantName, assistantImage
         }, { new: true });

         return res.status(200).json(user);

    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "update assistant error"});
    }


}

export const askToAssistant = async (req, res) => {
    try {
        const { command } = req.body;
        if (!command || typeof command !== "string") {
            return res.status(400).json({ response: "Command is required" });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ response: "User not found" });
        }

        user.history.push(command);
        await user.save();
        const userName = user.name;
        const assistantName = user.assistantName;
        const geminiResult = await geminiResponse(command, assistantName, userName);
        if (!geminiResult?.ok) {
            const fallback = fallbackAssistantResponse(command, geminiResult?.message);
            if (process.env.NODE_ENV !== "production" && geminiResult?.debugMessage) {
                fallback.debug = geminiResult.debugMessage;
            }
            return res.json(fallback);
        }

        const cleanedResult = geminiResult.text.replace(/```json|```/gi, "").trim();
        const jsonMatch = cleanedResult.match(/{[\s\S]*}/);

        let gemResult;
        if (jsonMatch) {
            try {
                gemResult = JSON.parse(jsonMatch[0]);
            } catch {
                gemResult = {
                    type: "general",
                    userInput: command,
                    response: "I could not process that response. Please try again."
                };
            }
        } else {
            gemResult = {
                type: "general",
                userInput: command,
                response: cleanedResult || "I could not understand that. Please try again."
            };
        }

        const type = gemResult.type;

        switch(type) {
            case 'get_date': 
            return res.json({ 
                type,
                userInput: gemResult.userInput,
                response:` Today is ${moment().format("YYYY-MM-DD")}`
             });

             case 'get_time': 
            return res.json({ 
                type,
                userInput: gemResult.userInput,
                response:` The current time is ${moment().format("HH:mm:ss")}`
             });

             case 'get_day': 
            return res.json({ 
                type,
                userInput: gemResult.userInput,
                response:` Today is ${moment().format("dddd")}`
             });

             case 'get_month': 
            return res.json({ 
                type,
                userInput: gemResult.userInput,
                response:` Today is ${moment().format("MMMM")}`
             });

             case 'google_search':
                case 'youtube_search':
                    case 'youtube_play':
                        case 'calculator_open':
                            case 'general':
                                case 'instagram_open':
                                    case 'facebook_open':
                                        case 'weather-show': 
                                        return res.json({
                                            type,
                                            userInput: gemResult.userInput,
                                            response: gemResult.response
                                        });

                                        default:
                                            return res.json({
                                                type: "general",
                                                userInput: gemResult.userInput || command,
                                                response: gemResult.response || "I could not process that command."
                                            });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ response: "ask assistant error" });
    }
}
