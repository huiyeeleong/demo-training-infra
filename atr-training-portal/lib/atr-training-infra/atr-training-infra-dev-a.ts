import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Vpc, SubnetType } from 'aws-cdk-lib/aws-ec2';
import { Cluster, FargateTaskDefinition, ContainerImage} from 'aws-cdk-lib/aws-ecs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';

import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as efs from 'aws-cdk-lib/aws-efs';
import * as logs from 'aws-cdk-lib/aws-logs';
import { aws_dynamodb as dynamodb } from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export class ATRTrainingInfraDevA extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const existingVpc = Vpc.fromLookup(this, 'ExistingVPC', {
          isDefault: false,
          vpcName: 'ATRTrainingVPC'
        });

        const executionRole = new iam.Role(this, 'FargateExecutionRoleDevA', {
          assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com')
      });
      
        executionRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'));
        const taskRole = new iam.Role(this, 'FargateTaskRoleDev', {
          assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com')
      });
   
      // Grant full EFS permissions (but usually, the mount operation would use the execution role)
      taskRole.addToPolicy(new iam.PolicyStatement({
          resources: ['*'],
          actions: ['elasticfilesystem:*']
      }));
      
      // Grant full DynamoDB permissions
      taskRole.addToPolicy(new iam.PolicyStatement({
          resources: ['*'],
          actions: ['dynamodb:*']
      }));
      
      // Grant full S3 permissions
      taskRole.addToPolicy(new iam.PolicyStatement({
          resources: ['*'],
          actions: ['s3:*']
      }));
      
      
        const logGroup = new logs.LogGroup(this, 'FargateLogGroupDevA', {
          retention: logs.RetentionDays.ONE_WEEK
        
        });
        // Ensure you have defined the 'taskDefinition'
        const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDefinitionDevA', {
            executionRole: executionRole,
            taskRole: taskRole
   
          });

        const container = taskDefinition.addContainer('ATRTrainingContainerDevA', {
            image: ecs.ContainerImage.fromRegistry("882636998479.dkr.ecr.ap-southeast-2.amazonaws.com/atr-training-ecr-a:latest"),
            memoryLimitMiB: 512,
            logging: new ecs.AwsLogDriver({
              streamPrefix: 'FargateDevA',
              logGroup: logGroup
          })
        });

        container.addPortMappings({
            containerPort: 80
        });

        // Ensure you have defined the 'sg' (Security Group)
        const sg = new ec2.SecurityGroup(this, 'SGdevA', {
            vpc: existingVpc,
            allowAllOutbound: true,
        });

        sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));


        // Application Load Balancer
        const lb = new elbv2.ApplicationLoadBalancer(this, 'LBDevA', {
          vpc: existingVpc,
          internetFacing: true
        });

        const listener = lb.addListener('PublicListener', {
          port: 80,
          defaultAction: elbv2.ListenerAction.fixedResponse(200, {
              contentType: 'text/plain',
              messageBody: 'Fixed response content'
          })
        });
      
        const cluster = new Cluster(this, 'ATRTrainingClusterDevA', {
          vpc: existingVpc,
          clusterName: 'ATRTrainingClusterDevA'
        });

        // create the target group
        const targetGroup = new elbv2.ApplicationTargetGroup(this, 'ECSGroupDevA', {
          port: 80,
          targetType: elbv2.TargetType.IP,
          vpc: existingVpc,
        });

        
        

        const fargateService = new ecs.FargateService(this, 'FargateServiceDevA', {
          cluster,
          taskDefinition,
          desiredCount: 1,
          assignPublicIp: false,
          securityGroups: [sg],
          serviceName: 'FargateServiceDevA'
        });

        // Add the Fargate service to the listener targets
        listener.addTargets('ECS', {
          targets: [fargateService],
          port: 80
        });

        // Create a new security group for the EFS.
        const efsSecurityGroup = new ec2.SecurityGroup(this, 'EFSSecurityGroup', {
          vpc: existingVpc,
          description: 'Allow inbound access from 10.0.0.0/16 to EFS',
          allowAllOutbound: true,
        });

        const fileSystemPolicy = new iam.PolicyDocument({
          statements: [],
        });
        

        // Allow inbound access from the desired IP range.
        efsSecurityGroup.addIngressRule(ec2.Peer.ipv4('10.0.0.0/16'), ec2.Port.tcp(2049), 'Allow NFS access from within VPC');
        // Create an EFS file system
        const fileSystem = new efs.FileSystem(this, 'EfsFileSystemDevA', {
            vpc: existingVpc,
            securityGroup: efsSecurityGroup,
            lifecyclePolicy: efs.LifecyclePolicy.AFTER_30_DAYS, // or another appropriate policy
            removalPolicy: RemovalPolicy.DESTROY, // This will delete the EFS file system when the stack is deleted
            vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
            fileSystemPolicy: fileSystemPolicy
        });


        // Create an EFS access point
        const accessPoint = fileSystem.addAccessPoint('AccessPoint', {
            path: '/mydata', // This is the path within EFS where your data will reside
            createAcl: {
                ownerUid: '1001',
                ownerGid: '10001',
                permissions: '755'
            },
            posixUser: {
                uid: '1001',
                gid: '10001'
            }
        });

        // Second access point
        const accessPoint2 = fileSystem.addAccessPoint('AccessPoint2', {
          path: '/mydata2', // Path within EFS for the second data
          createAcl: {
              ownerUid: '1002',
              ownerGid: '10002',
              permissions: '755'
          },
          posixUser: {
              uid: '1002',
              gid: '10002'
          }
      });
        
//        fileSystem.grantReadWrite(taskRole);

        taskDefinition.addVolume({
          name: 'EfsVolume1DevA',
          efsVolumeConfiguration: {
              fileSystemId: fileSystem.fileSystemId,
              transitEncryption: 'ENABLED'
          }
      });
      
      taskDefinition.addVolume({
          name: 'EfsVolume2DevA',
          efsVolumeConfiguration: {
              fileSystemId: fileSystem.fileSystemId,
              transitEncryption: 'ENABLED'
          }
      });
      
      // Add two mount points to the container in the Fargate task definition
      // First mount point
      container.addMountPoints({
        containerPath: '/containerdata1', 
        sourceVolume: 'EfsVolume1DevA',
        readOnly: false,
    });

      
      // Second mount point
      container.addMountPoints({
        containerPath: '/containerdata2',
        sourceVolume: 'EfsVolume2DevA',
        readOnly: false,
    });

    //Define the DynamoDB table
    const table = new dynamodb.Table(this, 'DynamoDBTableDevA', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      tableName: 'ATRTrainingDynamoDBDevA',
      removalPolicy: RemovalPolicy.DESTROY,  // Use with caution: This means the table will be deleted when the stack is destroyed
    });

    // Add a GSI (Global Secondary Index) if needed
    table.addGlobalSecondaryIndex({
      indexName: 'GSIName',
      partitionKey: { name: 'gsiKey', type: dynamodb.AttributeType.STRING },
    });
}
}





