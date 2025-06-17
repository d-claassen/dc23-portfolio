/* eslint-disable no-console */

const fs = require( 'fs' );
const path = require( 'path' );

// Get version from command-line argument
const newVersion = process.argv[ 2 ];

if ( ! newVersion ) {
	console.error( 'Please provide a version as an argument.' );
	process.exit( 1 );
}

// Determine the parent directory (plugin folder name)
const parentDir = path.resolve( __dirname, '..' );
const pluginFile = `${ path.basename( parentDir ) }.php`;

// Define files to update with their respective patterns
const files = [
	{
		path: path.join( parentDir, pluginFile ),
		pattern: /^( \* Version:\s*)(\d+\..+)$/m,
	},
	{
		path: path.join( parentDir, 'readme.txt' ),
		pattern: /^(Stable tag:\s*)(\d+\..+)$/m,
	},
];

let hasError = false;

files.forEach( ( { path: filePath, pattern } ) => {
	try {
		const content = fs.readFileSync( filePath, 'utf8' );

		// Update the relevant version tag
		const updatedContent = content.replace( pattern, `$1${ newVersion }` );

		fs.writeFileSync( filePath, updatedContent );
		console.log( `Updated ${ filePath } to version ${ newVersion }` );
	} catch ( error ) {
		console.error( `Error updating ${ filePath }: ${ error.message }` );
		hasError = true;
	}
} );

// Exit with error if any file update failed
if ( hasError ) {
	process.exit( 1 );
}
