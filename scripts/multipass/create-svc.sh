echo '---- Create Instance --------------------'
multipass launch --name svc-user-auth
multipass mount ../../../user-auth-server svc-user-auth:/build-user-auth
multipass mount `pwd` svc-user-auth:/build
echo '---- Install dependencies --------------------'
multipass exec svc-user-auth -- sh -x /build/install-packages.sh
echo '---- Configure Instance --------------------'
multipass exec svc-user-auth -- sh -x /build/configure-svc.sh
multipass list
echo '---------------------------------------------'
