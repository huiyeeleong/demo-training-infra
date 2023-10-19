import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Vpc, SubnetType } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class ATRTrainingVPC extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create the VPC
    const vpc = new Vpc(this, 'ATRTrainingVPC', {
      vpcName: 'ATRTrainingVPC',
      cidr: '10.0.0.0/16',
      maxAzs: 3,  // By default, maxAzs is set to 3, adjust if necessary.
      subnetConfiguration: [
        {
          cidrMask: 24,  // Define the size of the subnet
          name: 'PublicSubnet',
          subnetType: SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,  // Define the size of the subnet
          name: 'PrivateSubnet',
          subnetType: SubnetType.PRIVATE_WITH_NAT,
        }
      ],
      natGateways: 1, // Define number of NAT gateways (default is one per AZ)
    });
  }
}

const app = new App();
new ATRTrainingVPC(app, 'ATRTrainingVPCStack');
