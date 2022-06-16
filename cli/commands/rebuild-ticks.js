'use strict';


const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );
const LIB_LINE_BY_LINE = require( 'line-by-line' );


//=====================================================================
//=====================================================================
//
//		rebuild-ticks
//
//=====================================================================
//=====================================================================


exports.command = 'rebuild-ticks';
exports.describe = 'Rebuild the database of SimTicks from the files found in data/ticks.';
exports.builder =
	function ( YARGS ) 
	{
		return;
	};
exports.handler =
	async function ( argv )
	{
		await argv.App.command_processor(
			'rebuild-ticks', argv,
			async function ( App )
			{
				let SuperUser = {
					_m: {
						owner: {
							name: 'CLI SuperUser',
							email: 'SuperUser@simtrader',
						}
					},
					role: 'super',
				};

				let ticks_path = LIB_PATH.resolve( App.SimTicksManager.Configuration.ticks_path );

				// Delete the existing SimTicks.
				{
					let api_result = await App.SimTicksManager.DeleteAll( SuperUser );
					if ( api_result.error ) { throw new Error( api_result.error ); }
				}

				// Get the file list.
				let tick_filenames = LIB_FS.readdirSync( ticks_path );

				// Create SimTick entries in the database for each file.
				for ( let index = 0; index < tick_filenames.length; index++ )
				{
					let tick_filename = tick_filenames[ index ];
					let tick_info = tick_filename.split( '.' )[ 0 ];
					let tick_infos = tick_info.split( ',' );
					if ( tick_infos.length !== 3 ) { continue; }
					let prototype = {
						symbol: tick_infos[ 0 ],
						day: parseInt( tick_infos[ 1 ] ),
						hour: parseInt( tick_infos[ 2 ] ),
						session: '',
						filename: tick_filename,
						tick_count: 0,
					};
					// Classify the session.
					if ( prototype.hour < 8 ) { prototype.session = 'night'; }
					else if ( prototype.hour < 16 ) { prototype.session = 'day'; }
					else { prototype.session = 'evening'; }
					// Count the ticks.
					{
						let filename = LIB_PATH.join( ticks_path, prototype.filename );
						let content = LIB_FS.readFileSync( filename, 'utf-8' );
						let lines = content.split( '\n' );
						lines.forEach( function ( item ) { if ( item.length ) { prototype.tick_count++; } } );
					}
					// Store the entry.
					{
						App.Log.info( `Storing [${prototype.symbol}], Day ${prototype.day}, Hour ${prototype.hour}, Ticks ${prototype.tick_count}` );
						let api_result = await App.SimTicksManager.CreateOne( SuperUser, prototype );
						if ( api_result.error ) { throw new Error( api_result.error ); }
					}
				}

				//---------------------------------------------------------------------
				// Return and exit the application.
				return { process_exit_code: 0 };
			} );
	};

