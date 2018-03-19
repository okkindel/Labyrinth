import java.util.ArrayList;
import java.util.*;

public class Generator
{
	private ArrayList <Cell> cells = new ArrayList<>();
	private int size, loop_counter, numberOfRow = 1;
	private String[][] table;

	public Generator(int width, int height)
	{
		loop_counter = height;
		size = width;
		table = new String[30*width][30*height];

		/*filling array with '#'*/
		for(int i = 0; i < 30*width; i++){
			for(int j = 0; j < 30*height; j++){
				table[i][j] = "###";
			}
		}

		/*adding cells to array list*/
		for (int i = 1; i <= size+1; i++){ 
			Cell cell = new Cell(i);
			cells.add(cell);
		}
	}

	void launcher()
	{
		/*first row*/
		row_generete();

		/*Char output current*/
		System.out.print("");
		System.out.print("[");
		for(int i = 0; i <= (3*size)-3; i++){
			System.out.print("1, ");
		}
		System.out.print("1");
		System.out.print("],");

		for (int i=1; i<=loop_counter; i++){
			alternative_out();
			next_row();
			numberOfRow+=2;
			row_generete();
		}
		System.out.print("\n[");
		for(int i = 0; i <= (3*size)-3; i++){
			System.out.print("1, ");
		}
		System.out.print("1");
		System.out.print("]");
	}

	private void row_generete()
	{
		Random setGenerator = new Random();

		/*random vertical walls*/
		for (int i = 1; i <= size - 1; i++){
			if (cells.get(i).set==cells.get(i+1).set)
				cells.get(i).wall = true;
			if (setGenerator.nextInt(2) == 0){
				cells.get(i).wall = true;
			}
			else{
				cells.get(i+1).set = cells.get(i).set;
			}
		}

		/*random horizontal walls*/
		boolean was_break = false;
		try {

			for (int i=1; i<=size-1; i++)
			{
				if (cells.get(i+1).set==cells.get(i).set)
				{
					if (setGenerator.nextInt(2)==1){
						cells.get(i).bottom = false;
						was_break = true;
					}
					else
						cells.get(i).bottom = true;
				}
				if (cells.get(i+1).set!=cells.get(i).set)
				{
					if (!was_break){
						cells.get(i).bottom = false;
						was_break = false;
					}
					else{
						cells.get(i).bottom = setGenerator.nextInt(2) != 1;
						was_break = false;
					}
				}
			}
		}
		catch (Exception e){
			System.out.println( "Something wrong with " + e );
		}

	}

	private void next_row(){
		Random setGenerator = new Random();
		System.out.print("");

		/*clearing array list for next row*/
		for (int i = 1; i<=size; i++)
		{
			cells.get(i).wall = false;
			if (cells.get(i).bottom){
				cells.get(i).set=setGenerator.nextInt(10000);
				cells.get(i).bottom=false;
			}
		}
	}

	private void alternative_out()
	{
		Random setGenerator = new Random();
		int [] a = new int[3];
		int x;

		try{
			System.out.print("\n[1, ");
			for (int i=1; i <=size-1; i++)
			{
				// kinda ugly, i know :/
				for (int j=0; j<3; j++) {
					x = setGenerator.nextInt(100);
					if (x < 2) a[j] = 2; else if (x < 4) a[j] = 3;
					else a[j] = 1;
				}

				if (!cells.get(i).wall && cells.get(i).bottom)
					System.out.print(a[0]+", "+a[1]+", "+a[2]+", ");
				if (!cells.get(i).wall && !cells.get(i).bottom)
					System.out.print("0, 0, 0, ");
				if (cells.get(i).wall && !cells.get(i).bottom)
					System.out.print("0, "+a[0]+", 0, ");
				if (cells.get(i).wall && cells.get(i).bottom){
					if (cells.get(i + 1).bottom)
						System.out.print(a[0]+", "+a[1]+", 0, ");
					else if (!cells.get(i + 1).bottom)
						System.out.print("0, "+a[0]+", "+a[1]+", ");
				}
			}
			System.out.print("1],");
		}
		catch (Exception e){
			System.out.println( "Something wrong with " + e );
		}
	}
}
