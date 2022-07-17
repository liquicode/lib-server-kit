'use strict';


app.controller(
	'Explorer_Controller',
	function ( $scope, $http, $window, $location, $cookies )
	{


		//---------------------------------------------------------------------
		var Page = {
			User: window.SERVER_DATA.User,
			Socket: null,
			Invoke: {
				as_user: null,
				verb: '',
				service_name: '',
				endpoint_name: '',
				parameters: [],
				values: {},
				response: null,
			},
			Elements: {
				InvokeModal: document.getElementById( 'invoke-modal' ),
				InvokeResponse: document.getElementById( 'invoke-response' ),
			},
		};
		$scope.Page = Page;


		//---------------------------------------------------------------------
		let visbility_map = {};


		//---------------------------------------------------------------------
		if ( Page.User )
		{
			SocketApi.NewSocket( Page.User,
				( Socket, Status ) =>
				{
					if ( Status !== 'OK' )
					{
						console.error( 'Socket connection failed.' );
						return;
					}
					Page.Socket = Socket;
				} );
		}


		//---------------------------------------------------------------------
		Page.ToggleContentVisible =
			function ToggleContentVisible( content_id )
			{
				visbility_map[ content_id ] = !visbility_map[ content_id ];
				return;
			};


		//---------------------------------------------------------------------
		Page.IsContentVisible =
			function IsContentVisible( content_id )
			{
				return !!visbility_map[ content_id ];
			};


		//---------------------------------------------------------------------
		Page.ShowInvokeModal =
			function ShowInvokeModal( Verb, ServiceName, EndpointName, Parameters )
			{
				// Initialize the Invoke object.
				Page.Invoke.as_user = Page.User.user_id;
				Page.Invoke.verb = Verb;
				Page.Invoke.service_name = ServiceName;
				Page.Invoke.endpoint_name = EndpointName;
				Page.Invoke.parameters = Parameters;
				// Initialize the Invoke values.
				Page.Invoke.values = {};
				for ( let index = 0; index < Parameters.length; index++ )
				{
					let parameter = Parameters[ index ];
					Page.Invoke.values[ parameter.name ] = null;
				}
				Page.Invoke.response = null;
				Page.SetInvokeResponse();
				// Show the Invoke modal.
				Page.Elements.InvokeModal.style.display = 'block';
				return;
			};


		//---------------------------------------------------------------------
		Page.HideInvokeModal =
			function HideInvokeModal()
			{
				Page.Elements.InvokeModal.style.display = 'none';
				return;
			};


		//---------------------------------------------------------------------
		window.onclick =
			function ( event )
			{
				if ( event.target === Page.Elements.InvokeModal )
				{
					// Close the modal if it is currently active and the user clicks on the background window.
					Page.Elements.InvokeModal.style.display = 'none';
				}
				return;
			};


		//---------------------------------------------------------------------
		function express_callback( Error, Response )
		{
			if ( Error )
			{
				console.error( 'Express Error: ' + Error.message );
				Page.Invoke.response = Error;
			}
			else
			{
				console.log( 'Express response:', Response );
				Page.Invoke.response = Response;
			}
			// $scope.$apply();
			Page.SetInvokeResponse();
			return;
		}


		//---------------------------------------------------------------------
		function socket_callback( Response )
		{
			console.log( 'Socket response:', Response );
			Page.Invoke.response = Response;
			// $scope.$apply();
			Page.SetInvokeResponse();
			return;
		}


		//---------------------------------------------------------------------
		Page.SetInvokeResponse =
			function SetInvokeResponse()
			{
				let text = '';
				if ( Page.Invoke.response )
				{
					text = JSON.stringify( Page.Invoke.response, null, '    ' );
				}
				Page.Elements.InvokeResponse.innerHTML = text;
				w3CodeColor();
				return;
			};


		//---------------------------------------------------------------------
		Page.InvokeFunction =
			function InvokeFunction()
			{
				console.log( "Invoking [" + Page.Invoke.verb + "] on " + Page.Invoke.service_name + "." + Page.Invoke.endpoint_name );

				// Get the parameter values.
				let values = [];
				for ( let index = 0; index < Page.Invoke.parameters.length; index++ )
				{
					let parameter = Page.Invoke.parameters[ index ];
					let value = Page.Invoke.values[ parameter.name ];
					switch ( parameter.schema.type )
					{
						case 'boolean':
							value = Boolean( value );
							break;
						case 'integer':
							value = parseInt( value );
							break;
						case 'number':
							value = parseFloat( value );
							break;
						case 'string':
							value = '' + value;
							break;
						case 'array':
							if ( !Array.isArray( value ) )
							{
								value = [ value ];
							}
							break;
						case 'object':
							value = JSON.parse( value );
							break;
					}
					values.push( value );
				}

				// Invoke the function.
				switch ( Page.Invoke.verb )
				{
					case 'Call':
						if ( !Page.Socket )
						{
							socket_callback( 'Login is required to perform socket calls.' );
							return;
						}
						Page.Socket[ Page.Invoke.service_name ][ Page.Invoke.endpoint_name ]( ...values, socket_callback );
						break;
					case 'Get':
						ExpressApi[ Page.Invoke.service_name ][ 'get_' + Page.Invoke.endpoint_name ]( ...values, express_callback );
						break;
					case 'Put':
						ExpressApi[ Page.Invoke.service_name ][ 'put_' + Page.Invoke.endpoint_name ]( ...values, express_callback );
						break;
					case 'Post':
						ExpressApi[ Page.Invoke.service_name ][ 'post_' + Page.Invoke.endpoint_name ]( ...values, express_callback );
						break;
					case 'Delete':
						ExpressApi[ Page.Invoke.service_name ][ 'delete_' + Page.Invoke.endpoint_name ]( ...values, express_callback );
						break;
					case 'Visit':
						alert( 'Visit is not implemented!' );
						break;
				}

				return;
			};


		//---------------------------------------------------------------------
		// Fixup some styles on the Invoke modal's Response field.
		// Page.Elements.InvokeResponse.style.maxHeight = '300px';
		// Page.Elements.InvokeResponse.style.overflowX = 'auto';
		// Page.Elements.InvokeResponse.style.overflowY = 'auto';


		//---------------------------------------------------------------------
		// Exit Controller
		return;
	} );

