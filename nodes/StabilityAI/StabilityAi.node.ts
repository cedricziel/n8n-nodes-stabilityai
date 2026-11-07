import {
	NodeApiError,
	NodeConnectionType,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';
import {
	stabilityGenerateCoreRequest,
	stabilityGenerateSd3Request,
	stabilityGenerateUltraRequest,
	type AspectRatio,
	type OutputFormat,
	type StableImageCoreRequest,
	type StableImageSd3Request,
	type StableImageUltraRequest,
} from './GenericFunctions';
import { imageServiceOperations } from './StabilityAiDescription';

export class StabilityAi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'StabilityAI',
		name: 'stabilityAi',
		icon: 'file:stabilityai.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the Stability AI API',
		defaults: {
			name: 'StabilityAI',
		},
		// eslint-disable-next-line n8n-nodes-base/node-class-description-inputs-wrong-regular-node
		inputs: ['main' as NodeConnectionType],
		// eslint-disable-next-line n8n-nodes-base/node-class-description-outputs-wrong
		outputs: ['main' as NodeConnectionType],
		credentials: [
			{
				name: 'stabilityAiApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.stability.ai',
			url: '',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		/**
		 * In the properties array we have two mandatory options objects required
		 *
		 * [Resource & Operation]
		 *
		 * https://docs.n8n.io/integrations/creating-nodes/code/create-first-node/#resources-and-operations
		 *
		 * In our example, the operations are separated into their own file (HTTPVerbDescription.ts)
		 * to keep this class easy to read.
		 *
		 */
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Image',
						value: 'image',
					},
				],
				default: 'image',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Generate Image',
						value: 'generate',
						action: 'Generate image an image',
					},
				],
				displayOptions: {
					show: {
						resource: ['image'],
					},
				},
				default: 'generate',
			},

			...imageServiceOperations,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData = [];
		let responseData: INodeExecutionData[];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			if (resource === 'image') {
				if (operation === 'generate') {
					const imageService = this.getNodeParameter('imageService', i) as string;

					if (imageService === 'stable-image-ultra') {
						const prompt = this.getNodeParameter('prompt', i) as string;
						const outputFormat = this.getNodeParameter('output_format', i, undefined) as
							| OutputFormat
							| undefined;
						const aspectRatio = this.getNodeParameter('aspect_ratio', i, undefined) as
							| AspectRatio
							| undefined;
						const negativePrompt = this.getNodeParameter('negative_prompt', i) as
							| string
							| undefined;
						const seed: number = this.getNodeParameter('seed', i, undefined) as number;

						const request: StableImageUltraRequest = {
							prompt,
							output_format: outputFormat,
							aspect_ratio: aspectRatio,
							negative_prompt: negativePrompt !== '' ? negativePrompt : undefined,
							seed: seed !== 0 ? seed : undefined,
						};

						// perform fetch request
						responseData = await stabilityGenerateUltraRequest.call(this, i, request);
						returnData.push(responseData);
					} else if (imageService === 'stable-image-core') {
						const prompt = this.getNodeParameter('prompt', i) as string;
						const outputFormat = this.getNodeParameter('output_format', i, undefined) as
							| OutputFormat
							| undefined;
						const aspectRatio = this.getNodeParameter('aspect_ratio', i, undefined) as
							| AspectRatio
							| undefined;
						const negativePrompt = this.getNodeParameter('negative_prompt', i) as
							| string
							| undefined;
						const style_preset = this.getNodeParameter('style_preset', i) as string | undefined;

						const seed: number = this.getNodeParameter('seed', i, undefined) as number;

						const request: StableImageCoreRequest = {
							prompt,
							output_format: outputFormat,
							aspect_ratio: aspectRatio,
							negative_prompt: negativePrompt !== '' ? negativePrompt : undefined,
							seed: seed !== 0 ? seed : undefined,
							style_preset: style_preset !== '' ? style_preset : undefined,
						};

						// perform fetch request
						responseData = await stabilityGenerateCoreRequest.call(this, i, request);
						returnData.push(responseData);
					} else if (imageService === 'sd3') {
						const prompt = this.getNodeParameter('prompt', i) as string;
						const outputFormat = this.getNodeParameter('output_format', i, undefined) as
							| OutputFormat
							| undefined;
						const aspectRatio = this.getNodeParameter('aspect_ratio', i, undefined) as
							| AspectRatio
							| undefined;
						const negativePrompt = this.getNodeParameter('negative_prompt', i) as
							| string
							| undefined;
						const seed: number = this.getNodeParameter('seed', i, undefined) as number;
						const sd3model = this.getNodeParameter('sd3model', i) as string;

						const request: StableImageSd3Request = {
							prompt,
							output_format: outputFormat,
							aspect_ratio: aspectRatio,
							negative_prompt: negativePrompt !== '' ? negativePrompt : undefined,
							seed: seed !== 0 ? seed : undefined,
							mode: 'text-to-image',
							model: sd3model,
						};

						// perform fetch request
						responseData = await stabilityGenerateSd3Request.call(this, i, request);
						returnData.push(responseData);
					} else {
						throw new NodeApiError(
							this.getNode(),
							{},
							new Error(`Unsupported image service ${imageService}`),
						);
					}
				}
			}
		}

		return returnData;
	}
}
