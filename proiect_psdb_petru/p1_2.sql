set serveroutput on;
DECLARE
    v_deptno_max dept.deptno%TYPE;
    v_newdeptname dept.dname%TYPE := 'New Dept Name';
    v_deptno dept.deptno%TYPE;
    v_dname dept.dname%TYPE;
    v_loc dept.loc%TYPE;
BEGIN
	select max(deptno)
	into v_deptno_max
	from dept;
	
	dbms_output.put_line (v_deptno_max);
    
    insert into dept
    values (v_deptno_max + 10, &v_newdeptname, null);
    
    select DEPTNO ,DNAME, LOC
    into v_deptno, v_dname, v_loc
    from dept
    where deptno = (v_deptno_max+10);
    
    dbms_output.put_line ('New department:');
    dbms_output.put_line (v_deptno || ' ' || v_dname || ' ' || v_loc);
END;
