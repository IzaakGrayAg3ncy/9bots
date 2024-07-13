const sharp = require('sharp');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function createDiscordMessageImage(quote, nickname, avatarURL, outputPath = './output.png') {
    const width = 800;
    const avatarSize = 50;
    const padding = 20;
    const fontSize = 16;
    const usernameFontSize = 20; // Increase to match Discord's username size
    const lineHeight = 1.375 * usernameFontSize; // line-height: 1.375rem
    const timestampFontSize = 12;
    const backgroundColor = '#313338';
    const usernameColor = '#ad2440'; // Updated username color
    const textColor = '#DCDDDE';
    const timestampColor = '#949ba4';
    const mediumFontPath = path.join(__dirname, 'fonts', 'whitneymedium.otf');
    const boldFontPath = path.join(__dirname, 'fonts', 'whitneysemibold.otf');

    // Ensure quote is a string
    if (typeof quote !== 'string') {
        throw new Error('Quote must be a string');
    }

    // Calculate dynamic height based on the quote length
    const words = quote.split(' ');
    let currentLine = '';
    const lines = [];

    words.forEach(word => {
        const testLine = currentLine + word + ' ';
        const testLineWidth = testLine.length * fontSize * 0.6; // Adjust this multiplier as needed
        if (testLineWidth < (width - padding * 3 - avatarSize - padding)) {
            currentLine = testLine;
        } else {
            lines.push(currentLine);
            currentLine = word + ' ';
        }
    });

    lines.push(currentLine.trim());
    const dynamicHeight = Math.ceil(padding * 2 + avatarSize + lineHeight * lines.length);

    console.log(`Dynamic height: ${dynamicHeight}, Width: ${width}`);

    if (dynamicHeight <= 0 || width <= 0) {
        throw new Error('Invalid dimensions for the image.');
    }

    // Load the avatar image from URL
    const avatarResponse = await axios.get(avatarURL, { responseType: 'arraybuffer' });
    const avatarBuffer = avatarResponse.data;
    const avatar = await sharp(Buffer.from(avatarBuffer))
        .resize(avatarSize, avatarSize)
        .composite([
            {
                input: Buffer.from(
                    `<svg width="${avatarSize}" height="${avatarSize}">
                        <circle cx="${avatarSize / 2}" cy="${avatarSize / 2}" r="${avatarSize / 2}" />
                    </svg>`
                ),
                blend: 'dest-in'
            }
        ])
        .png()
        .toBuffer();

    // Create the background image
    const background = sharp({
        create: {
            width: width,
            height: dynamicHeight, // Ensure valid height
            channels: 4,
            background: backgroundColor
        }
    }).png();

    // Load the fonts as base64
    const mediumFontBuffer = fs.readFileSync(mediumFontPath);
    const boldFontBuffer = fs.readFileSync(boldFontPath);
    const mediumFontBase64 = mediumFontBuffer.toString('base64');
    const boldFontBase64 = boldFontBuffer.toString('base64');

    // Use a static timestamp
    const timestamp = "Today at Hate O' Clock";

    // Create the main image
    const image = await background
        .composite([
            { input: avatar, top: padding, left: padding }
        ])
        .toBuffer();

    // Write the main image to a file with text
    await sharp(image)
        .composite([
            {
                input: Buffer.from(`<svg width="${width}" height="${dynamicHeight}">
                    <style>
                        @font-face {
                            font-family: 'Whitney';
                            src: url('data:font/opentype;base64,${mediumFontBase64}') format('opentype');
                            font-weight: normal;
                        }
                        @font-face {
                            font-family: 'Whitney';
                            src: url('data:font/opentype;base64,${boldFontBase64}') format('opentype');
                            font-weight: bold;
                        }
                        .username {
                            fill: ${usernameColor};
                            font-size: ${usernameFontSize}px;
                            font-family: 'Whitney';
                            font-weight: 700;
                            line-height: ${lineHeight}px;
                            letter-spacing: normal;
                            word-spacing: normal;
                            display: inline;
                            vertical-align: baseline;
                            position: relative;
                            overflow: hidden;
                            flex-shrink: 0;
                        }
                        .timestamp {
                            fill: ${timestampColor};
                            font-size: ${timestampFontSize}px;
                            font-family: 'Whitney';
                            font-weight: normal;
                        }
                        .quote {
                            fill: ${textColor};
                            font-size: ${fontSize}px;
                            font-family: 'Whitney';
                            font-weight: normal;
                            letter-spacing: normal;
                            word-spacing: normal;
                            white-space: pre-wrap;
                        }
                    </style>
                    <text x="${padding + avatarSize + padding}" y="${padding + usernameFontSize}" class="username">${nickname}</text>
                    <text x="${padding + avatarSize + padding + nickname.length * usernameFontSize * 0.6 + 10}" y="${padding + usernameFontSize}" class="timestamp">${timestamp}</text>
                    ${lines.map((line, index) => `<text x="${padding + avatarSize + padding}" y="${padding + usernameFontSize + lineHeight + index * lineHeight}" class="quote">${line}</text>`).join('')}
                </svg>`),
                top: 0,
                left: 0
            }
        ])
        .toFile(outputPath);

    console.log(`Image saved to ${outputPath}`);
}

module.exports = createDiscordMessageImage;
