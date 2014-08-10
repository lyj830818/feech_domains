import socket
import dns.resolver
import sys

resolver = dns.resolver.Resolver()
resolver.lifetime = 10.0

nameServerFile = 'us.txt'
nameServers = [line.strip() for line in open(nameServerFile) ]

checkedFile = 'checked.txt'
fCheck = open(checkedFile, 'w')
checkedList = []

for nameServer in nameServers:
	resolver.nameservers=[nameServer]
	try:
		rdata = resolver.query('www.baidu.com', 'A')
		checkedList.append(nameServer)
		print nameServer
		print rdata
	except Exception, e:
		print "occur exception %s , %s" % (e, nameServer)
	
fCheck.write("\n".join(checkedList))
#print nameServers



# Basic query
#for rdata in dns.resolver.query('www.yahoo.com', 'CNAME') :
#    print (rdata.target)

# Set the DNS Server
'''
resolver = dns.resolver.Resolver()
resolver.lifetime = 10.0
resolver.nameservers=['8.8.8.1']
for rdata in resolver.query('www.yahoo.com', 'A') :
    print (rdata)
'''
