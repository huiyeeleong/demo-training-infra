import json
import os
import boto3

BUCKET_NAME = os.environ.get('BUCKET_NAME')
s3_client = boto3.client('s3')

def handler(event, context):
    http_method = event['httpMethod']
    
    if http_method == 'PUT':
        body = json.loads(event['body'])
        key = body.get('key')
        data = body.get('data')
        s3_client.put_object(Bucket=BUCKET_NAME, Key=key, Body=data)
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Item uploaded'})
        }
    
    elif http_method == 'GET':
        key = event['queryStringParameters']['key']
        data = s3_client.get_object(Bucket=BUCKET_NAME, Key=key)['Body'].read().decode('utf-8')
        return {
            'statusCode': 200,
            'body': data
        }

    elif http_method == 'DELETE':
        key = event['queryStringParameters']['key']
        s3_client.delete_object(Bucket=BUCKET_NAME, Key=key)
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Item deleted'})
        }

    else:
        return {
            'statusCode': 400,
            'body': json.dumps({'message': 'Invalid request'})
        }
