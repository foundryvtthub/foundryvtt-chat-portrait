import CONSTANTS from "../constants.js";

export async function getToken(documentUuid) {
    const document = await fromUuid(documentUuid);
    //
    return document?.token ?? document;
}
export function getOwnedTokens(priorityToControlledIfGM) {
    const gm = game.user?.isGM;
    if (gm) {
        if (priorityToControlledIfGM) {
            const arr = canvas.tokens?.controlled;
            if (arr && arr.length > 0) {
                return arr;
            } else {
                return canvas.tokens?.placeables;
            }
        } else {
            return canvas.tokens?.placeables;
        }
    }
    if (priorityToControlledIfGM) {
        const arr = canvas.tokens?.controlled;
        if (arr && arr.length > 0) {
            return arr;
        }
    }
    let ownedTokens = canvas.tokens?.placeables.filter((token) => token.isOwner && (!token.document.hidden || gm));
    if (ownedTokens.length === 0 || !canvas.tokens?.controlled[0]) {
        ownedTokens = canvas.tokens?.placeables.filter(
            (token) => (token.observer || token.isOwner) && (!token.document.hidden || gm),
        );
    }
    return ownedTokens;
}
export function is_UUID(inId) {
    return typeof inId === "string" && (inId.match(/\./g) || []).length && !inId.endsWith(".");
}
export function getUuid(target) {
    // If it's an actor, get its TokenDocument
    // If it's a token, get its Document
    // If it's a TokenDocument, just use it
    // Otherwise fail
    const document = getDocument(target);
    return document?.uuid ?? false;
}
export function getDocument(target) {
    if (target instanceof foundry.abstract.Document) return target;
    return target?.document;
}
export function is_real_number(inNumber) {
    return !isNaN(inNumber) && typeof inNumber === "number" && isFinite(inNumber);
}
export function isGMConnected() {
    return !!Array.from(game.users).find((user) => user.isGM && user.active);
}
export function isGMConnectedAndSocketLibEnable() {
    return isGMConnected() && !game.settings.get(CONSTANTS.MODULE_ID, "doNotUseSocketLibFeature");
}
export function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
export function isActiveGM(user) {
    return user.active && user.isGM;
}
export function getActiveGMs() {
    return game.users?.filter(isActiveGM);
}
export function isResponsibleGM() {
    if (!game.user?.isGM) return false;
    return !getActiveGMs()?.some((other) => other.id < game.user?.id);
}

// =========================================================================================
export function cleanUpString(stringToCleanUp) {
    // regex expression to match all non-alphanumeric characters in string
    const regex = /[^A-Za-z0-9]/g;
    if (stringToCleanUp) {
        return i18n(stringToCleanUp).replace(regex, "").toLowerCase();
    } else {
        return stringToCleanUp;
    }
}
export function isStringEquals(stringToCheck1, stringToCheck2, startsWith = false) {
    if (stringToCheck1 && stringToCheck2) {
        const s1 = cleanUpString(stringToCheck1) ?? "";
        const s2 = cleanUpString(stringToCheck2) ?? "";
        if (startsWith) {
            return s1.startsWith(s2) || s2.startsWith(s1);
        } else {
            return s1 === s2;
        }
    } else {
        return stringToCheck1 === stringToCheck2;
    }
}
/**
 * The duplicate function of foundry keep converting my stirng value to "0"
 * i don't know why this methos is a brute force solution for avoid that problem
 */
export function duplicateExtended(obj) {
    try {
        //
        if (structuredClone) {
            //
            return structuredClone(obj);
        } else {
            // Shallow copy
            // const newObject = jQuery.extend({}, oldObject);
            // Deep copy
            // const newObject = jQuery.extend(true, {}, oldObject);
            return jQuery.extend(true, {}, obj);
        }
    } catch (e) {
        return duplicate(obj);
    }
}
// =========================================================================================
/**
 *
 * @param obj Little helper for loop enum element on typescript
 * @href https://www.petermorlion.com/iterating-a-typescript-enum/
 * @returns
 */
export function enumKeys(obj) {
    return Object.keys(obj).filter((k) => Number.isNaN(+k));
}
/**
 * @href https://stackoverflow.com/questions/7146217/merge-2-arrays-of-objects
 * @param target
 * @param source
 * @param prop
 */
export function mergeByProperty(target, source, prop) {
    for (const sourceElement of source) {
        const targetElement = target.find((targetElement) => {
            return sourceElement[prop] === targetElement[prop];
        });
        targetElement ? Object.assign(targetElement, sourceElement) : target.push(sourceElement);
    }
    return target;
}
/**
 * Returns the first selected token
 */
export function getFirstPlayerTokenSelected() {
    // Get first token ownted by the player
    const selectedTokens = canvas.tokens?.controlled;
    if (selectedTokens.length > 1) {
        //iteractionFailNotification(i18n("foundryvtt-arms-reach.warningNoSelectMoreThanOneToken"));
        return null;
    }
    if (!selectedTokens || selectedTokens.length == 0) {
        //if(game.user.character.token){
        //  //
        //  return game.user.character.token;
        //}else{
        return null;
        //}
    }
    return selectedTokens[0];
}
/**
 * Returns a list of selected (or owned, if no token is selected)
 * note: ex getSelectedOrOwnedToken
 */
export function getFirstPlayerToken() {
    // Get controlled token
    let token;
    const controlled = canvas.tokens?.controlled;
    // Do nothing if multiple tokens are selected
    if (controlled.length && controlled.length > 1) {
        //iteractionFailNotification(i18n("foundryvtt-arms-reach.warningNoSelectMoreThanOneToken"));
        return null;
    }
    // If exactly one token is selected, take that
    token = controlled[0];
    if (!token) {
        if (!controlled.length || controlled.length == 0) {
            // If no token is selected use the token of the users character
            token = canvas.tokens?.placeables.find((token) => token.document.actorId === game.user?.character?.id);
        }
        // If no token is selected use the first owned token of the users character you found
        if (!token) {
            token = canvas.tokens?.ownedTokens[0];
        }
    }
    return token;
}
// =============================
// Module specific function
// =============================
