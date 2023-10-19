import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_apigateway as apigateway, aws_lambda as lambda, aws_s3 as s3 } from 'aws-cdk-lib';

export class ATRApiGWStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create an S3 bucket
    const bucket = new s3.Bucket(this, 'S3Bucket', {
      removalPolicy: RemovalPolicy.DESTROY
    });

    // Create a Lambda function
    const lambdaFunction = new lambda.Function(this, 'LambdaFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lib/atr-apigw/lambda.zip'),
      environment: {
        BUCKET_NAME: bucket.bucketName
      }
    });

    bucket.grantReadWrite(lambdaFunction);

    // Create an API Gateway REST API
    const api = new apigateway.RestApi(this, 'API', {
      restApiName: 'My Service',
      description: 'This service serves a bucket.',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS
      }
    });

    const integration = new apigateway.LambdaIntegration(lambdaFunction);
    
    const items = api.root.addResource('items');
    items.addMethod('GET', integration);
    items.addMethod('PUT', integration);
    items.addMethod('DELETE', integration);
  }
}
